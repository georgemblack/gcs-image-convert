# Web Image Drop

This service was formerly used to convert/resize images in GCS. Specifically:

1. An image would land in a GCS bucket
2. A pub/sub event would be triggered
3. This service would read the image, transform it, and place the result(s) in a new bucket

Pretty simple, but also handy.
