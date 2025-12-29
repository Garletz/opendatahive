import * as babylon from "babylonjs";

export interface TorusItem {
  id?: string;
  backgroundColor?: string;
  lineColor?: string;
  size?: number; // diameter
  thickness?: number; // torus tube thickness
  lineWidth?: number;
  bright?: boolean;
  onClick?: () => void;
}

export interface TorusMesh extends babylon.Mesh {
  isGenericContextItem: boolean;
  data: {
    item: TorusItem;
  };
}

/**
 * A factory to create the babylon.js mesh for Torus
 */
export default class TorusMeshFactory {
  constructor() {}

  /**
   * Returns a projected torus drawn item for the given object
   * @param item - The DTO to produce a babylon.js drawn item for
   * @param scene - The Babylon.js scene
   * @returns The babylon.js Mesh representing the item
   */
  getMesh(item: TorusItem, scene: babylon.Scene): TorusMesh {
    const diameter = item.size || 1;
    const thickness = item.thickness || diameter / 4;

    const torus = babylon.MeshBuilder.CreateTorus(
      item.id || "torus",
      {
        diameter: diameter,
        thickness: thickness,
        tessellation: 32,
      },
      scene
    ) as TorusMesh;

    // Create a dynamic texture
    const dynTexture = new babylon.DynamicTexture(
      "torusTexture",
      512,
      scene,
      true
    );
    const mat = new babylon.StandardMaterial("torusMat", scene);
    mat.diffuseTexture = dynTexture;
    mat.specularColor = new babylon.Color3(0, 0, 0);
    mat.emissiveColor = item.bright ? new babylon.Color3(1, 1, 1) : new babylon.Color3(0.1, 0.1, 0.1);
    mat.backFaceCulling = true;
    torus.material = mat;

    // Draw on the dynamic texture
    const context = dynTexture.getContext();
    const size = dynTexture.getSize();
    context.clearRect(0, 0, size.width, size.height);
    context.fillStyle = item.backgroundColor || "#ffffff";
    context.fillRect(0, 0, size.width, size.height);
    context.lineWidth = item.lineWidth || 4;
    context.strokeStyle = item.lineColor || "#000000";
    // Example: draw concentric circles
    for (let i = 1; i <= 4; i++) {
      context.beginPath();
      context.arc(size.width / 2, size.height / 2, (size.width / 2) * (i / 4), 0, 2 * Math.PI);
      context.stroke();
    }
    // Example: draw radial lines
    for (let i = 0; i < 12; i++) {
      const angle = (i * 2 * Math.PI) / 12;
      context.beginPath();
      context.moveTo(size.width / 2, size.height / 2);
      context.lineTo(
        size.width / 2 + (size.width / 2) * Math.cos(angle),
        size.height / 2 + (size.height / 2) * Math.sin(angle)
      );
      context.stroke();
    }
    dynTexture.update(true);

    torus.isGenericContextItem = true;
    torus.data = torus.data || {};
    torus.data.item = item;
    // Ajoute un flag pour l'animation
    (torus as any).isRotating = true;

    // Méthode pour rendre le torus plus "vif" (effet soleil)
    (torus as any).setVividColors = () => {
      // Boost emissive color
      if (torus.material && torus.material instanceof babylon.StandardMaterial) {
        torus.material.emissiveColor = new babylon.Color3(1, 0.85, 0.1); // jaune vif
        torus.material.diffuseColor = new babylon.Color3(1, 0.7, 0.2); // orange lumineux
        torus.material.specularColor = new babylon.Color3(1, 1, 0.5);
      }
      // Redessine la texture avec des couleurs plus saturées et un halo
      const context = dynTexture.getContext();
      const size = dynTexture.getSize();
      context.clearRect(0, 0, size.width, size.height);
      // Halo
      const gradient = context.createRadialGradient(
        size.width / 2, size.height / 2, size.width * 0.2,
        size.width / 2, size.height / 2, size.width * 0.5
      );
      gradient.addColorStop(0, '#fffbe6');
      gradient.addColorStop(0.5, '#ffe066');
      gradient.addColorStop(1, '#ffb300');
      context.fillStyle = gradient;
      context.fillRect(0, 0, size.width, size.height);
      // Cercles concentriques plus vifs
      context.lineWidth = item.lineWidth || 6;
      context.strokeStyle = '#ff9800';
      for (let i = 1; i <= 4; i++) {
        context.beginPath();
        context.arc(size.width / 2, size.height / 2, (size.width / 2) * (i / 4), 0, 2 * Math.PI);
        context.stroke();
      }
      // Rayons
      context.strokeStyle = '#ffd600';
      for (let i = 0; i < 16; i++) {
        const angle = (i * 2 * Math.PI) / 16;
        context.beginPath();
        context.moveTo(size.width / 2, size.height / 2);
        context.lineTo(
          size.width / 2 + (size.width / 2) * Math.cos(angle),
          size.height / 2 + (size.height / 2) * Math.sin(angle)
        );
        context.stroke();
      }
      dynTexture.update(true);
    };

    return torus;
  }
}
