from importlib import metadata

try:
    __version__ = metadata.version(__package__)
except metadata.PackageNotFoundError as e:
    __version__ = "0.0.dev0"

from reality_capture import service  # noqa: F401, E402
from reality_capture import specifications  # noqa: F401, E402
