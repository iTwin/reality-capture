import pytest
from unittest.mock import patch, MagicMock
import reality_capture.specifications.production as production


class TestSpecifications:

    def test_export_options_parsing(self):
        export_obj_dict = {"format": "OBJ",
                           "name": "Production_5",
                           "options": {
                               "textureColorSource": "Visible",
                           }
                           }
        export_create_obj = production.ExportCreate(**export_obj_dict)
        assert isinstance(export_create_obj.options, production.OptionsOBJ)

        export_3dtiles_dict = {"format": "3DTiles",
                               "name": "Production_5",
                               "options": {
                                   "textureColorSource": "Visible",
                               }
                               }
        export_create_3dtiles = production.ExportCreate(**export_3dtiles_dict)
        assert isinstance(export_create_3dtiles.options, production.Options3DTiles)

        export_3mx_dict = {"format": "3MX", "name": "My3MX", "options": {"crs": "EPSG:4978"}}
        export_create_3mx = production.ExportCreate(**export_3mx_dict)
        assert isinstance(export_create_3mx.options, production.Options3MX)

        export_i3s_dict = {"format": "I3S", "name": "MyI3S", "options": {"crs": "EPSG:4978"}}
        export_create_i3s = production.ExportCreate(**export_i3s_dict)
        assert isinstance(export_create_i3s.options, production.OptionsI3S)

        export_las_dict = {"format": "LAS", "name": "MyLas", "options": {"crs": "EPSG:4978"}}
        export_create_las = production.ExportCreate(**export_las_dict)
        assert isinstance(export_create_las.options, production.OptionsLAS)

        export_ply_dict = {"format": "PLY", "name": "MyPly", "options": {"crs": "EPSG:4978"}}
        export_create_ply = production.ExportCreate(**export_ply_dict)
        assert isinstance(export_create_ply.options, production.OptionsPLY)

        export_opc_dict = {"format": "OPC", "name": "MyOpc", "options": {"crs": "EPSG:4978"}}
        export_create_opc = production.ExportCreate(**export_opc_dict)
        assert isinstance(export_create_opc.options, production.OptionsOPC)

        export_odsm_dict = {"format": "OrthophotoDSM", "name": "MyOdsm", "options": {"crs": "EPSG:4978"}}
        export_create_odsm = production.ExportCreate(**export_odsm_dict)
        assert isinstance(export_create_odsm.options, production.OptionsOrthoDSM)

        export_osgb_dict = {"format": "OSGB", "name": "MyOsgb", "options": {"crs": "EPSG:4978"}}
        export_create_osgb = production.ExportCreate(**export_osgb_dict)
        assert isinstance(export_create_osgb.options, production.OptionsOSGB)

    def test_export_options_from_object(self):
        construct_from_object = production.ExportCreate(format=production.Format.OBJ, options=production.OptionsOBJ())

    def test_validate_options_unsupported_format_raises_value_error(self):
        unknown_format = MagicMock()
        unknown_format.return_value = unknown_format  # make it callable returning itself

        with patch.object(production, "Format") as mock_format:
            # Make Format(value) return a sentinel that matches no branch in validate_options
            unsupported = MagicMock(name="UnsupportedFormat")
            mock_format.return_value = unsupported
            mock_format.THREED_TILES = production.Format.THREED_TILES
            mock_format.OBJ = production.Format.OBJ
            mock_format.THREEMX = production.Format.THREEMX
            mock_format.I3S = production.Format.I3S
            mock_format.OSGB = production.Format.OSGB
            mock_format.LAS = production.Format.LAS
            mock_format.PLY = production.Format.PLY
            mock_format.OPC = production.Format.OPC
            mock_format.ORTHOPHOTO_DSM = production.Format.ORTHOPHOTO_DSM

            with pytest.raises(Exception) as exc_info:
                production.ExportCreate(**{"format": "3DTiles", "options": {"crs": "EPSG:4978"}})

            # Pydantic wraps ValueError in ValidationError, check the cause
            assert "Unsupported format type" in str(exc_info.value)

