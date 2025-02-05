from importlib import metadata

try:
    __version__ = metadata.version(__package__)
except metadata.PackageNotFoundError as e:
    __version__ = "0.0.0-clone"
