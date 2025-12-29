import * as babylon from "babylonjs";

interface HexDefinition {
  hexagon_edge_to_edge_width: number;
}

interface SphereItem {
  id?: string;
  backgroundColor?: string;
  lineColor?: string;
  size?: number;
  lineWidth?: number;
  bright?: boolean;
  borderStar?: {
    radius1: number;
    radius2: number;
    points: number;
    borderColor: string;
  };
  onClick?: () => void;
}

interface SphereMesh extends babylon.Mesh {
  isGenericContextItem: boolean;
  data: {
    item: SphereItem;
  };
}

/**
 * A factory to create the babylon.js mesh for Sphere
 */
export default class SphereMeshFactory {
  private hexDefinition: HexDefinition;

  constructor(hexDefinition: HexDefinition) {
    this.hexDefinition = hexDefinition;
  }

  /**
   * Returns a projected sphere drawn item for the given object
   * @param item - The DTO to produce a babylon.js drawn item for
   * @param scene - The Babylon.js scene
   * @returns The babylon.js Mesh representing the item
   */
  getMesh(item: SphereItem, scene: babylon.Scene): SphereMesh {
    const diameter =
      (item.size || 100) * this.hexDefinition.hexagon_edge_to_edge_width / 100;
    const sphere = babylon.MeshBuilder.CreateSphere(item.id || "sphere", {segments: 16, diameter: diameter}, scene) as SphereMesh;

    const latitudeTexture = new babylon.DynamicTexture(
      "dynamic texture",
      512,
      scene,
      true
    );

    const latitudeMaterial = new babylon.StandardMaterial("mat", scene);
    latitudeMaterial.diffuseTexture = latitudeTexture;
    latitudeMaterial.specularColor = new babylon.Color3(0, 0, 0);
    latitudeMaterial.emissiveColor = new babylon.Color3(0.1, 0.1, 0.1);
    latitudeMaterial.backFaceCulling = true;

    sphere.material = latitudeMaterial;

    let context = latitudeTexture.getContext();
    const size = latitudeTexture.getSize();

    context.fillStyle = item.backgroundColor || "#ffffff";
    context.fillRect(0, 0, size.width, size.height);

    //With how a texture is mapped against a sphere, we can do all the latitude lines and they have a consistent thickness
    let lineWidth = 2 * ((item.lineWidth || 2) / (Math.PI * diameter)) * size.height; //Ratio of Latitudinal circumference to texture height
    context.lineWidth = lineWidth;
    context.strokeStyle = item.lineColor || "#000000";

    context.beginPath();
    context.moveTo(0, size.height / 2);
    context.lineTo(size.width, size.height / 2);
    context.stroke();

    context.beginPath();
    context.moveTo(0, size.height / 6);
    context.lineTo(size.width, size.height / 6);
    context.stroke();

    context.beginPath();
    context.moveTo(0, size.height / 3);
    context.lineTo(size.width, size.height / 3);
    context.stroke();

    context.beginPath();
    context.moveTo(0, 2 * size.height / 3);
    context.lineTo(size.width, 2 * size.height / 3);
    context.stroke();

    context.beginPath();
    context.moveTo(0, 5 * size.height / 6);
    context.lineTo(size.width, 5 * size.height / 6);
    context.stroke();

    //For the longitudinal lines, if we just drew them straight they'd be shrunk at the poles.
    //Draw them bit by bit, with the width appropriate for the longitude
    context.lineWidth = 1;
    const equatorLineWidth = lineWidth;
    for (let i = 0; i < size.height; i++) {
      //What's our compresion ratio? The ratio of the equator circumference to the current slice's circumference
      lineWidth =
        equatorLineWidth *
        (Math.PI *
          diameter /
          (2 * Math.PI * (diameter * Math.sin(Math.PI * i / size.height))));

      //Draw the wide line just like a printer
      //The 0.5 is a twiddle factor because canvas co-ordinates are between pixels

      //Each path is one line. 2 lines meeting look turn into a great circle around the sphere.
      //Hard coded to 6 great circle, someone could make them configureable again if desired.
      context.beginPath();
      context.moveTo(size.height / 12 - 0.5 * lineWidth, i + 0.5);
      context.lineTo(size.height / 12 + 0.5 * lineWidth, i + 0.5);
      context.stroke();

      context.beginPath();
      context.moveTo(size.height / 4 - 0.5 * lineWidth, i + 0.5);
      context.lineTo(size.height / 4 + 0.5 * lineWidth, i + 0.5);
      context.stroke();

      context.beginPath();
      context.moveTo(5 * size.height / 12 - 0.5 * lineWidth, i + 0.5);
      context.lineTo(5 * size.height / 12 + 0.5 * lineWidth, i + 0.5);
      context.stroke();

      context.beginPath();
      context.moveTo(7 * size.height / 12 - 0.5 * lineWidth, i + 0.5);
      context.lineTo(7 * size.height / 12 + 0.5 * lineWidth, i + 0.5);
      context.stroke();

      context.beginPath();
      context.moveTo(9 * size.height / 12 - 0.5 * lineWidth, i + 0.5);
      context.lineTo(9 * size.height / 12 + 0.5 * lineWidth, i + 0.5);
      context.stroke();

      context.beginPath();
      context.moveTo(11 * size.height / 12 - 0.5 * lineWidth, i + 0.5);
      context.lineTo(11 * size.height / 12 + 0.5 * lineWidth, i + 0.5);
      context.stroke();
    }
    latitudeTexture.update(true);
    if (item.borderStar) {
      //The item is a star, give it an Emissive Color
      latitudeMaterial.emissiveColor = new babylon.Color3(1, 1, 1);
      //Give it a corona billboard
      const corona = babylon.MeshBuilder.CreateDisc(
        "t",
        {
          radius: diameter / 2 + item.borderStar.radius2,
          tessellation: 20,
          sideOrientation: (babylon.Mesh as any).DOUBLESIDE
        },
        scene
      );

      const coronaTexture = new babylon.DynamicTexture(
        "dynamic texture",
        512,
        scene,
        true
      );
      coronaTexture.hasAlpha = true;

      const coronaMaterial = new babylon.StandardMaterial("mat", scene);
      coronaMaterial.emissiveColor = new babylon.Color3(1, 1, 1);
      coronaMaterial.diffuseTexture = coronaTexture;
      corona.material = coronaMaterial;

      context = coronaTexture.getContext();
      const coronaSize = coronaTexture.getSize();

      let rot = Math.PI / 2 * 3;
      let x = coronaSize.width / 2;
      let y = coronaSize.height / 2;
      const step = Math.PI / item.borderStar.points;

      const outerRadius = coronaSize.width / 2;
      const innerRadius =
        outerRadius /
        (diameter / 2 + item.borderStar.radius2) *
        (diameter / 2 + item.borderStar.radius1);

      context.beginPath();
      context.moveTo(coronaSize.width / 2, coronaSize.height / 2 - outerRadius);
      for (let i = 0; i < item.borderStar.points; i++) {
        x = coronaSize.width / 2 + Math.cos(rot) * outerRadius;
        y = coronaSize.height / 2 + Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;

        x = coronaSize.width / 2 + Math.cos(rot) * innerRadius;
        y = coronaSize.height / 2 + Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
      context.lineTo(coronaSize.width / 2, coronaSize.height / 2 - outerRadius);
      context.closePath();
      context.lineWidth = 0;
      context.strokeStyle = item.lineColor || "#000000";
      context.stroke();
      context.fillStyle = item.borderStar.borderColor;
      context.fill();
      coronaTexture.update(true);

      corona.billboardMode = (babylon.Mesh as any).BILLBOARDMODE_ALL;
      corona.parent = sphere;
    }

    //My native co-ordinate system is rotated from Babylon.js
    sphere.rotation.x = Math.PI / 2;

    sphere.isGenericContextItem = true;
    sphere.data = sphere.data || {};
    sphere.data.item = item;
    return sphere;
  }
} 