from reality_capture.service.data_handler import RealityDataHandler
import pathlib

# You must define your own token factory : a class with a get_token method that returns an access token.
token_factory = type('TokenProvider', (), {'get_token': lambda self: ""})()
rdh = RealityDataHandler(token_factory)

r = rdh.upload_data("01db3a7c-07b0-43ac-b7c4-0b4fad050d6a", str(pathlib.Path(__file__)))
if r.is_error():
    print("Failed to upload data")

r = rdh.list_data("01db3a7c-07b0-43ac-b7c4-0b4fad050d6a")
if r.is_error():
    print("Failed to list data")
else:
    for f in r.value:
        print(f" - {f}")

r = rdh.download_data("01db3a7c-07b0-43ac-b7c4-0b4fad050d6a",
                      "./01db3a7c-07b0-43ac-b7c4-0b4fad050d6a")
if r.is_error():
    print("Failed to download data")
