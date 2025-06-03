from reality_capture.service.data_handler import BucketDataHandler
import pathlib

# You must define your own token factory : a class with a get_token method that returns an access token.
token_factory = type('TokenProvider', (), {'get_token': lambda self: ""})()
rdh = BucketDataHandler(token_factory)

r = rdh.upload_data("a24048da-8e9c-4e02-8159-fa29a122624e", str(pathlib.Path(__file__)))
if r.is_error():
    print("Failed to upload data")

r = rdh.list_data("a24048da-8e9c-4e02-8159-fa29a122624e")
if r.is_error():
    print("Failed to list data")
else:
    for f in r.value:
        print(f" - {f}")

r = rdh.download_data("a24048da-8e9c-4e02-8159-fa29a122624e",
                      "./bucket")
if r.is_error():
    print("Failed to download data")
