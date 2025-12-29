import * as BABYLON from 'babylonjs';

export default class GraphmlMeshFactory {
  getMesh(item: any, scene: BABYLON.Scene) {
    // Visual: A document with a blue network node (GRAPHML)
    const width = item.size ? item.size * 1.1 : 22;
    const height = item.size ? item.size * 1.2 : 24;
    const thickness = item.thickness || 2;
    const doc = BABYLON.MeshBuilder.CreateBox(
      item.id || `graphml_doc_${Math.random()}`,
      { width, height, depth: thickness },
      scene
    );
    const mat = new BABYLON.StandardMaterial('graphmlMat', scene);
    mat.diffuseColor = new BABYLON.Color3(0.8, 0.9, 1);
    mat.specularColor = new BABYLON.Color3(0.7, 0.7, 1);
    mat.emissiveColor = new BABYLON.Color3(0.12, 0.18, 0.24); // halo bleu // pale blue
    doc.material = mat;
    // Add a blue node (sphere)
    const node = BABYLON.MeshBuilder.CreateSphere(
      item.id ? `${item.id}_node` : `graphml_node_${Math.random()}`,
      { diameter: width * 0.18 },
      scene
    );
    node.position.x = -width * 0.25;
    node.position.y = height * 0.18;
    node.position.z = thickness * 0.7;
    const nodeMat = new BABYLON.StandardMaterial('graphmlNodeMat', scene);
    nodeMat.diffuseColor = new BABYLON.Color3(0.2, 0.5, 1);
    nodeMat.specularColor = new BABYLON.Color3(0.7, 0.7, 1);
    nodeMat.emissiveColor = new BABYLON.Color3(0.12, 0.18, 0.24); // halo bleu // blue
    node.material = nodeMat;
    node.parent = doc;
    return doc;
  }
}
