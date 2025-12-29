import * as babylon from 'babylonjs';

/**
 * Mesh factory for Markdown (.md) octo files.
 * Creates a mesh that visually distinguishes Markdown files (e.g., a book shape).
 */
export default class MdMeshFactory {
  private internalId: number;

  constructor() {
    this.internalId = 0;
  }

  /**
   * Return a mesh for a Markdown file item.
   * @param item - The DTO to produce a Babylon.js mesh for
   * @param scene - The Babylon.js scene
   * @returns The Babylon.js Mesh for the given parameters
   */
  getMesh(item: any, scene: babylon.Scene): babylon.Mesh {
    // For Markdown, let's use a box with a 'page' effect (white color, maybe a slight blue stripe)
    const size = item.size || 22;
    const thickness = item.thickness || 3;
    const width = size * 0.8;
    const height = size * 1.1;
    const depth = thickness;

    // Create the box (book)
    const box = babylon.MeshBuilder.CreateBox(
      item.id || `mdbook_${this.internalId}`,
      { width, height, depth },
      scene
    );

    // Material: white with a blue edge
    const material = new babylon.StandardMaterial(`mdbook_mat_${this.internalId}`, scene);
    material.diffuseColor = new babylon.Color3(1, 1, 1); // white
    material.specularColor = new babylon.Color3(1, 1, 0.8); // plus lumineux
    material.emissiveColor = new babylon.Color3(0.25, 0.22, 0.10); // léger halo lumineux
    box.material = material;

    // Optionally, add a blue stripe (simulate book spine)
    // For simplicity, just scale the box and offset position
    box.position.x += width * 0.05;

    // Metadata
    this.internalId++;
    box.isGenericContextItem = true;
    box.data = box.data || {};
    box.data.item = item;
    box.rotation.y = -Math.PI / 2;
    box.rotation.z = -Math.PI / 2;
    return box;
  }
}
