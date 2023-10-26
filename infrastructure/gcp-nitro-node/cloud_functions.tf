resource "google_storage_bucket" "function_bucket" {
  name     = "${var.gcp_project_id}-function-bucket"
  location = "ASIA"
}

resource "google_storage_bucket_object" "function_object" {
  name   = "cloud_functions.zip"
  bucket = google_storage_bucket.function_bucket.name
  source = "${path.module}/../gcp-nitro-node/cloud_functions.zip"
}
