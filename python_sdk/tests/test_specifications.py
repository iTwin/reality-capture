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

    def test_export_options_from_object(self):
        construct_from_object = production.ExportCreate(format=production.Format.OBJ, options=production.OptionsOBJ())
