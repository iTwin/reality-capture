from reality_capture.specifications.tile_map_optimization import (TileMapOptimizationSpecificationsCreate,
                                                                  TileMapOptimizationInputs, TileMapOptimizationOptions,
                                                                  TileMapOptimizationFormat)

inputs = TileMapOptimizationInputs(tileMaps=["dbad181b-5079-4224-8561-96ad218bcfc9",
                                             "ea881e3e-b0e3-4b23-bc3f-4ee8e9acdf61"])
options = TileMapOptimizationOptions(format=TileMapOptimizationFormat.XYZ_TILE_MAP, backgroundColor="#000000")

specs = TileMapOptimizationSpecificationsCreate(inputs=inputs, options=options)
