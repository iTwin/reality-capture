from datetime import datetime, timedelta
from oauthlib.oauth2 import BackendApplicationClient
from requests_oauthlib import OAuth2Session


class ClientInfo:
    def __init__(self, client_id: str, env: str = "", secret: str = ""):
        self.env = env
        self.client_id = client_id
        self.secret = secret


class AccessToken:
    def __init__(self, access: str, refresh: str, token_type: str, valid_until: datetime):
        self._access = access
        self._refresh = refresh
        self._tok_type = token_type
        self._valid_until = valid_until

    def is_still_valid(self) -> bool:
        return datetime.now() < self._valid_until

    def get_auth(self):
        return self._tok_type + " " + self._access

    def get_refresh(self):
        return self._refresh


class ServiceTokenFactory:
    def __init__(self, client_info: ClientInfo):
        self._client_id = client_info.client_id
        self._env = client_info.env
        self._secret = client_info.secret
        if not self._env or self._env == "prod":
            ims_server = "ims.bentley.com"
        else:
            ims_server = "qa-ims.bentley.com"
        self._auth_point = "https://" + ims_server + "/connect/authorize"
        self._token_point = "https://" + ims_server + "/connect/token"

        self._token = None
        self._session = None

        self._client = BackendApplicationClient(self._client_id)
        self._session = OAuth2Session(client=self._client, scope=list("itwin-platform"))

    @staticmethod
    def _get_token_from_data(data: dict) -> AccessToken:
        valid = datetime.now() + timedelta(
            0, data["expires_in"] - 300
        )  # 5 minutes safe window
        return AccessToken(
            data["access_token"], data.get("refresh_token"), data["token_type"], valid
        )

    def get_token(self) -> str:

        if self._token is not None and self._token.is_still_valid():
            return self._token.get_auth()
        # token is not usable, we need a new token
        # asking for new token
        token_data = self._session.fetch_token(
            self._token_point,
            client_secret=self._secret,
            include_client_id=True,
            scope={"itwin-platform"},
        )

        self._token = self._get_token_from_data(token_data)
        return self._token.get_auth()

    def is_ok(self):
        return self._session.authorized()
