import * as babylon from "babylonjs";
import hexToRgb from "../../shared/utils/HexToRGB";

interface HexDefinition {
  hexagon_edge_to_edge_width: number;
  hexagon_half_wide_width: number;
  edgeSize: number;
}

interface ArrowItem {
  id?: string;
  lineWidth?: number;
  lineColor?: string;
  fillColor?: string;
  rotation?: number;
  scaleLength?: number;
  scaleWidth?: number;
  onClick?: () => void;
}

interface ArrowMesh extends babylon.Mesh {
  isGenericContextItem: boolean;
  data: {
    item: ArrowItem;
  };
}

/**
 * Factory for creating arrow drawn items, such as might represent gravity
 */
export default class ArrowMeshFactory {
  private hexDefinition: HexDefinition;
  private hexToRgb = hexToRgb;

  constructor(hexDefinition: HexDefinition) {
    this.hexDefinition = hexDefinition;
  }

  /**
   * Return an arrow mesh for the given object
   * @param item - The DTO to produce a Babylon.js mesh for
   * @param scene - The Babylon.js scene
   * @returns The Babylon.js Mesh representing the arrow
   */
  getMesh(item: ArrowItem, scene: babylon.Scene): ArrowMesh {
    // Default values
    const lineWidth = item.lineWidth || 4;
    const lineColor = item.lineColor || "#00aaff";
    const fillColor = item.fillColor || "#00aaff";
    const rotation = item.rotation || 0;
    const scaleLength = item.scaleLength || 0.75;
    const scaleWidth = item.scaleWidth || 0.75;

    // Create arrow segments using modern Babylon.js APIs
    const segment1 = babylon.MeshBuilder.CreateTube(
      "segment1",
      {
        path: [
          new babylon.Vector3(
            -this.hexDefinition.hexagon_edge_to_edge_width / 2,
            0,
            0
          ),
          new babylon.Vector3(0, -1 * this.hexDefinition.hexagon_half_wide_width, 0)
        ],
        radius: lineWidth,
        tessellation: 20
      },
      scene
    );

    const sphere1 = babylon.MeshBuilder.CreateSphere(
      "sphere1",
      {
        diameter: 2 * lineWidth,
        segments: 20
      },
      scene
    );
    sphere1.position.x = 0;
    sphere1.position.y = -1 * this.hexDefinition.hexagon_half_wide_width;

    // Then straight down
    const segment2 = babylon.MeshBuilder.CreateTube(
      "segment2",
      {
        path: [
          new babylon.Vector3(
            0,
            -1 * this.hexDefinition.hexagon_half_wide_width,
            0
          ),
          new babylon.Vector3(0, -this.hexDefinition.edgeSize / 2, 0)
        ],
        radius: lineWidth,
        tessellation: 20
      },
      scene
    );

    const sphere2 = babylon.MeshBuilder.CreateSphere(
      "sphere2",
      {
        diameter: 2 * lineWidth,
        segments: 20
      },
      scene
    );
    sphere2.position.x = 0;
    sphere2.position.y = -this.hexDefinition.edgeSize / 2;

    // Then right
    const segment3 = babylon.MeshBuilder.CreateTube(
      "segment3",
      {
        path: [
          new babylon.Vector3(0, -this.hexDefinition.edgeSize / 2, 0),
          new babylon.Vector3(
            this.hexDefinition.hexagon_edge_to_edge_width / 2,
            -this.hexDefinition.edgeSize / 2,
            0
          )
        ],
        radius: lineWidth,
        tessellation: 20
      },
      scene
    );

    const sphere3 = babylon.MeshBuilder.CreateSphere(
      "sphere3",
      {
        diameter: 2 * lineWidth,
        segments: 20
      },
      scene
    );
    sphere3.position.x = this.hexDefinition.hexagon_edge_to_edge_width / 2;
    sphere3.position.y = -this.hexDefinition.edgeSize / 2;

    // Then down again for the butt of the arrow
    const segment4 = babylon.MeshBuilder.CreateTube(
      "segment4",
      {
        path: [
          new babylon.Vector3(
            this.hexDefinition.hexagon_edge_to_edge_width / 2,
            -this.hexDefinition.edgeSize / 2,
            0
          ),
          new babylon.Vector3(
            this.hexDefinition.hexagon_edge_to_edge_width / 2,
            this.hexDefinition.edgeSize / 2,
            0
          )
        ],
        radius: lineWidth,
        tessellation: 20
      },
      scene
    );

    const sphere4 = babylon.MeshBuilder.CreateSphere(
      "sphere4",
      {
        diameter: 2 * lineWidth,
        segments: 20
      },
      scene
    );
    sphere4.position.x = this.hexDefinition.hexagon_edge_to_edge_width / 2;
    sphere4.position.y = this.hexDefinition.edgeSize / 2;

    // Then back left
    const segment5 = babylon.MeshBuilder.CreateTube(
      "segment5",
      {
        path: [
          new babylon.Vector3(
            this.hexDefinition.hexagon_edge_to_edge_width / 2,
            this.hexDefinition.edgeSize / 2,
            0
          ),
          new babylon.Vector3(0, this.hexDefinition.edgeSize / 2, 0)
        ],
        radius: lineWidth,
        tessellation: 20
      },
      scene
    );

    const sphere5 = babylon.MeshBuilder.CreateSphere(
      "sphere5",
      {
        diameter: 2 * lineWidth,
        segments: 20
      },
      scene
    );
    sphere5.position.x = 0;
    sphere5.position.y = this.hexDefinition.edgeSize / 2;

    // Then down
    const segment6 = babylon.MeshBuilder.CreateTube(
      "segment6",
      {
        path: [
          new babylon.Vector3(0, this.hexDefinition.edgeSize / 2, 0),
          new babylon.Vector3(0, this.hexDefinition.hexagon_half_wide_width, 0)
        ],
        radius: lineWidth,
        tessellation: 20
      },
      scene
    );

    const sphere6 = babylon.MeshBuilder.CreateSphere(
      "sphere6",
      {
        diameter: 2 * lineWidth,
        segments: 20
      },
      scene
    );
    sphere6.position.x = 0;
    sphere6.position.y = this.hexDefinition.hexagon_half_wide_width;

    // Then back to the point
    const segment7 = babylon.MeshBuilder.CreateTube(
      "segment7",
      {
        path: [
          new babylon.Vector3(0, this.hexDefinition.hexagon_half_wide_width, 0),
          new babylon.Vector3(
            -this.hexDefinition.hexagon_edge_to_edge_width / 2,
            0,
            0
          )
        ],
        radius: lineWidth,
        tessellation: 20
      },
      scene
    );

    const sphere7 = babylon.MeshBuilder.CreateSphere(
      "sphere7",
      {
        diameter: 2 * lineWidth,
        segments: 20
      },
      scene
    );
    sphere7.position.x = -this.hexDefinition.hexagon_edge_to_edge_width / 2;
    sphere7.position.y = 0;

    // Merge all segments and spheres
    const arrow = babylon.Mesh.MergeMeshes([
      segment1, segment2, segment3, segment4, segment5, segment6, segment7,
      sphere1, sphere2, sphere3, sphere4, sphere5, sphere6, sphere7
    ]) as ArrowMesh;

    // Create material for arrow border
    const arrowBorderMaterial = new babylon.StandardMaterial(
      "arrowBorderMaterial",
      scene
    );
    const rgb = this.hexToRgb(lineColor);
    if (rgb) {
      arrowBorderMaterial.diffuseColor = new babylon.Color3(
        rgb.r / 256,
        rgb.g / 256,
        rgb.b / 256
      );
      arrowBorderMaterial.emissiveColor = new babylon.Color3(
        rgb.r / 256,
        rgb.g / 256,
        rgb.b / 256
      );
    }
    arrow.material = arrowBorderMaterial;

    // Add fill if specified
    if (fillColor) {
      // Create center shapes
      const shape1 = [
        new babylon.Vector3(
          0,
          -1 * this.hexDefinition.hexagon_half_wide_width,
          0
        ),
        new babylon.Vector3(0, this.hexDefinition.hexagon_half_wide_width, 0),
        new babylon.Vector3(
          -this.hexDefinition.hexagon_edge_to_edge_width / 2,
          0,
          0
        ),
        new babylon.Vector3(0, -1 * this.hexDefinition.hexagon_half_wide_width, 0)
      ];

      const shape2 = [
        new babylon.Vector3(0, this.hexDefinition.edgeSize / 2, 0),
        new babylon.Vector3(0, -this.hexDefinition.edgeSize / 2, 0),
        new babylon.Vector3(
          this.hexDefinition.hexagon_edge_to_edge_width / 2,
          -this.hexDefinition.edgeSize / 2,
          0
        ),
        new babylon.Vector3(
          this.hexDefinition.hexagon_edge_to_edge_width / 2,
          this.hexDefinition.edgeSize / 2,
          0
        ),
        new babylon.Vector3(0, this.hexDefinition.edgeSize / 2, 0)
      ];

      // Extrude shapes
      const extrudedCenter1 = babylon.MeshBuilder.ExtrudeShape(
        "extruded1",
        {
          shape: shape1,
          path: [
            new babylon.Vector3(0, 0, -1 * lineWidth),
            new babylon.Vector3(0, 0, lineWidth)
          ],
          scale: 1,
          rotation: 0,
          cap: (babylon.Mesh as any).CAP_END
        },
        scene
      );

      const extrudedCenter2 = babylon.MeshBuilder.ExtrudeShape(
        "extruded2",
        {
          shape: shape2,
          path: [
            new babylon.Vector3(0, 0, -1 * lineWidth),
            new babylon.Vector3(0, 0, lineWidth)
          ],
          scale: 1,
          rotation: 0,
          cap: (babylon.Mesh as any).CAP_END
        },
        scene
      );

      // Color the center
      const arrowCenterMaterial = new babylon.StandardMaterial(
        "arrowCenterMaterial",
        scene
      );
      const fillRgb = this.hexToRgb(fillColor);
      if (fillRgb) {
        arrowCenterMaterial.diffuseColor = new babylon.Color3(
          fillRgb.r / 256,
          fillRgb.g / 256,
          fillRgb.b / 256
        );
        arrowCenterMaterial.specularColor = new babylon.Color3(
          fillRgb.r / 256,
          fillRgb.g / 256,
          fillRgb.b / 256
        );
        arrowCenterMaterial.emissiveColor = new babylon.Color3(
          fillRgb.r / 256,
          fillRgb.g / 256,
          fillRgb.b / 256
        );
      }
      extrudedCenter1.material = arrowCenterMaterial;
      extrudedCenter2.material = arrowCenterMaterial;

      // Merge with fill
      const finalArrow = babylon.Mesh.MergeMeshes([
        arrow, 
        extrudedCenter1, 
        extrudedCenter2
      ]) as ArrowMesh;

      // Apply transformations
      finalArrow.scaling.x = scaleLength;
      finalArrow.scaling.y = scaleWidth;
      finalArrow.rotation.z = (rotation * Math.PI) / 180;

      finalArrow.isGenericContextItem = true;
      finalArrow.data = finalArrow.data || {};
      finalArrow.data.item = item;
      return finalArrow;
    }

    // Apply transformations to border-only arrow
    arrow.scaling.x = scaleLength;
    arrow.scaling.y = scaleWidth;
    arrow.rotation.z = (rotation * Math.PI) / 180;

    arrow.isGenericContextItem = true;
    arrow.data = arrow.data || {};
    arrow.data.item = item;
    return arrow;
  }
} 