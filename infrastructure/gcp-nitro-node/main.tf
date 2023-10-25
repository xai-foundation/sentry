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
    access_config {
      nat_ip = google_compute_address.default.address
    }
  }
  metadata_startup_script = local.startup_script
  service_account {
    scopes = ["https://www.googleapis.com/auth/compute.readonly", "https://www.googleapis.com/auth/cloud-platform.read-only"]
  }
}

resource "google_compute_firewall" "default" {
  name    = "allow-websocket-http"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["8547", "9642", "8548"]
  }

  source_ranges = ["0.0.0.0/0"]
}

output "instance_ip" {
  value = google_compute_instance.default.network_interface[0].access_config[0].nat_ip
}

output "websocket_url" {
  value = "ws://${google_compute_instance.default.network_interface[0].access_config[0].nat_ip}:8548"
}

output "http_url" {
  value = "http://${google_compute_instance.default.network_interface[0].access_config[0].nat_ip}:8547"
}

locals {
  markdown = <<-EOF
# URL Information

Instance IP: ${google_compute_instance.default.network_interface[0].access_config[0].nat_ip}
Websocket URL: ws://${google_compute_instance.default.network_interface[0].access_config[0].nat_ip}:8548
HTTP URL: http://${google_compute_instance.default.network_interface[0].access_config[0].nat_ip}:8547
EOF
}

resource "local_file" "url_info" {
  content  = local.markdown
  filename = "${path.module}/url_info.md"
}
