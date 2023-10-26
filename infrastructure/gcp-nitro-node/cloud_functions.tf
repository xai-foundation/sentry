resource "google_storage_bucket" "function_bucket" {
  name     = "${var.gcp_project_id}-function-bucket"
  location = "ASIA"
}

resource "google_storage_bucket_object" "function_object" {
  name   = "cloud_functions.zip"
  bucket = google_storage_bucket.function_bucket.name
  source = "${path.module}/../gcp-nitro-node/cloud_functions.zip"
}

resource "google_cloudfunctions2_function" "health_function" {
  name = "health"
  location = var.gcp_region
  description = "Health check function"

  build_config {
    runtime = "nodejs18"
    entry_point = "health"
    source {
      storage_source {
        bucket = google_storage_bucket.function_bucket.name
        object = google_storage_bucket_object.function_object.name
      }
    }
  }

  service_config {
    max_instance_count  = 1
    available_memory    = "128Mi"
    timeout_seconds     = 60
  }
}
