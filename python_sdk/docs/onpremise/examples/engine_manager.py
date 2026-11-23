import reality_capture.on_premise.engine_manager as engine_manager
import tempfile
import os

with tempfile.TemporaryDirectory() as temp_folder:
    with engine_manager.EngineManager(os.path.join(temp_folder, "engine_manager")) as em:
        hosts = em.get_engine_hostnames()
        print(hosts)
