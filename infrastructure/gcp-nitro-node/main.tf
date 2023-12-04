terraform {
  backend "gcs" {
    bucket = "xai-watchtower-node" # replace with a GCP bucket you make within your own GCP project.
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
  zone    = var.gcp_zone
}

locals {
  startup_script = file("${path.module}/scripts/startup_script.tpl")
}

resource "google_compute_address" "default" {
  name = "node-static-ip"
}

resource "google_service_account" "bucket_updater" {
  account_id   = "bucket-updater"
  display_name = "Bucket Updater Service Account"
  project      = var.gcp_project_id
}

resource "google_service_account_key" "bucket_updater_key" {
  service_account_id = google_service_account.bucket_updater.name
}

resource "google_storage_bucket_iam_member" "bucket_updater" {
  bucket = google_storage_bucket.public_bucket.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.bucket_updater.email}"
}

resource "google_compute_instance" "default" {
  name         = "arbitrum-full-node"
  machine_type = "n1-standard-4"
  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = "2000"
      type  = "pd-standard"
    }
  }
  network_interface {
    network = "default"
  }

  metadata_startup_script = local.startup_script

  metadata = {  
    service_account_key = google_service_account_key.bucket_updater_key.private_key
  }

  service_account {
    scopes = ["https://www.googleapis.com/auth/compute.readonly", "https://www.googleapis.com/auth/cloud-platform.read-only"]
  }
}

resource "google_storage_bucket" "public_bucket" {
  name     = var.bucket_name
  location = "ASIA"
}

# allow public access to the sitemap bucket
data "google_iam_policy" "viewer" {
	binding {
		role    = "roles/storage.objectViewer"
		members = [
			"allUsers",
		]
	}
}

locals {
  
  markdown = <<-EOF
# OUTPUT
Service Account Key: `${google_service_account_key.bucket_updater_key.private_key}`
EOF
}

resource "local_file" "url_info" {
  content  = local.markdown
  filename = "${path.module}/url_info.md"
}
