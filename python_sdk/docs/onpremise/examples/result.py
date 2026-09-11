import reality_capture.on_premise.engine_manager as engine_manager
import tempfile
import os

with tempfile.TemporaryDirectory() as temp_folder:
    em = engine_manager.EngineManager(os.path.join(temp_folder, "engine_manager"))
    r = em.get_engine("FakeEngine")
    if r.is_error():
        print(f"  Error: {r.get_error_as_str()}")
