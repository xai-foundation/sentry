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

resource "google_compute_disk" "default" {
  name                      = "nitro-full-node-disk"
  type                      = "pd-standard"
  size                      = "2000"
  image                     = "ubuntu-os-cloud/ubuntu-2204-lts"
  physical_block_size_bytes = 4096
  zone                      = var.gcp_zone
}

locals {
  startup_script = templatefile("${path.module}/startup_script.tpl", {
    parent_chain_rpc_url = var.parent_chain_rpc_url
  })
}

resource "google_compute_instance" "default" {
  name         = "arbitrum-full-node"
  machine_type = "n1-standard-4"
  boot_disk {
    source = google_compute_disk.default.name
  }
  network_interface {
    network = "default"
    access_config {
      // Ephemeral IP
    }
  }
  metadata_startup_script = local.startup_script
}
