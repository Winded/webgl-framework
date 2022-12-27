import { quat, vec3 } from './GLMatrix/index.js';

export const quad = {
    vertices: [
        // x, y, z, nx, ny, nz, u, v
        -0.5,  0.5, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0,
         0.5,  0.5, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0,
         0.5, -0.5, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0,
        -0.5, -0.5, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0,
    ],
    indices: [
        0, 1, 2,
        0, 2, 3,
    ],
};

export function generateSphereMesh(radius = 1, widthSegments = 32, heightSegments = 16, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI) {
    widthSegments = Math.max( 3, Math.floor( widthSegments ) );
    heightSegments = Math.max( 2, Math.floor( heightSegments ) );

    const thetaEnd = Math.min( thetaStart + thetaLength, Math.PI );

    let index = 0;
    const grid = [];

    const indices = [];
    const vertices = [];

    // generate vertices, normals and uvs
    for ( let iy = 0; iy <= heightSegments; iy ++ ) {

        const verticesRow = [];

        const v = iy / heightSegments;

        // special case for the poles
        let uOffset = 0;
        if ( iy == 0 && thetaStart == 0 ) {
            uOffset = 0.5 / widthSegments;
        } else if ( iy == heightSegments && thetaEnd == Math.PI ) {
            uOffset = - 0.5 / widthSegments;
        }

        for ( let ix = 0; ix <= widthSegments; ix ++ ) {

            const u = ix / widthSegments;

            // vertex
            let x = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
            let y = radius * Math.cos( thetaStart + v * thetaLength );
            let z = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
            vertices.push(x, y, z);

            // normal
            let normal = vec3.create();
            vec3.normalize(normal, vec3.fromValues(x, y, z));
            vertices.push(normal[0], normal[1], normal[2]);

            // uv
            vertices.push( u + uOffset, 1 - v );

            verticesRow.push( index ++ );
        }
        grid.push(verticesRow);
    }

    // indices
    for ( let iy = 0; iy < heightSegments; iy ++ ) {
        for ( let ix = 0; ix < widthSegments; ix ++ ) {
            const a = grid[ iy ][ ix + 1 ];
            const b = grid[ iy ][ ix ];
            const c = grid[ iy + 1 ][ ix ];
            const d = grid[ iy + 1 ][ ix + 1 ];

            if ( iy !== 0 || thetaStart > 0 ) indices.push( a, b, d );
            if ( iy !== heightSegments - 1 || thetaEnd < Math.PI ) indices.push( b, c, d );
        }
    }

    return {
        vertices: vertices,
        indices: indices,
    };
}

/**
 * 
 * @param {number} numSegments 
 * @param {number} startRadius 
 * @param {number} endRadius 
 * @param {number} thickness
 * 
 * @returns {{
*  vertices: number[];
*  indices: number[];
* }}
*/
export function generateCylinderMesh(numSegments, startRadius, endRadius, thickness) {
   if (numSegments < 3) {
       throw new Error("Cylinder must have at least 3 segments");
   }
   if (startRadius >= endRadius) {
       throw new Error("Start radius must be lower than end radius");
   }

   let points = {
       frontStart: [],
       frontEnd: [],
       backStart: [],
       backEnd: [],
   };
   let normals = {
       front: vec3.fromValues(0, 0, 1),
       back: vec3.fromValues(0, 0, -1),
       inward: [],
       outward: [],
   };

   const edgeAngle = 360 / numSegments;
   for (let i = 0; i < numSegments; i++) {
       let angle = edgeAngle * i;
       let angleQuat = quat.create();
       quat.fromEuler(angleQuat, 0, 0, angle);
       let direction = vec3.fromValues(0, 1, 0);
       vec3.transformQuat(direction, direction, angleQuat);

       normals.outward.push(vec3.clone(direction));
       let inward = vec3.create();
       vec3.inverse(inward, direction);
       normals.inward.push(inward);

       let startPoint = vec3.create();
       vec3.scale(startPoint, direction, startRadius);
       let frontStart = vec3.create();
       vec3.add(frontStart, startPoint, vec3.fromValues(0, 0, thickness / 2));
       points.frontStart.push(frontStart);
       let backStart = vec3.create();
       vec3.add(backStart, startPoint, vec3.fromValues(0, 0, -(thickness / 2)));
       points.backStart.push(backStart);

       let endPoint = vec3.create();
       vec3.scale(endPoint, direction, endRadius);
       let frontEnd = vec3.create();
       vec3.add(frontEnd, endPoint, vec3.fromValues(0, 0, thickness / 2));
       points.frontEnd.push(frontEnd);
       let backEnd = vec3.create();
       vec3.add(backEnd, endPoint, vec3.fromValues(0, 0, -(thickness / 2)));
       points.backEnd.push(backEnd);
   }

   let vertexArray = [];
   const pushVertex = (point, normal) => {
       vertexArray.push(...point);
       vertexArray.push(...normal);

       vertexArray.push(
           (point[0] + endRadius) / (endRadius * 2),
           (point[1] + endRadius) / (endRadius * 2)
       );
   };

   for (let i = 0; i < numSegments; i++) {
       let n = i + 1;
       if (n >= numSegments) {
           n = 0;
       }

       pushVertex(points.frontStart[i], normals.front);
       pushVertex(points.frontEnd[i], normals.front);
       pushVertex(points.frontStart[n], normals.front);

       pushVertex(points.frontEnd[i], normals.front);
       pushVertex(points.frontEnd[n], normals.front);
       pushVertex(points.frontStart[n], normals.front);

       pushVertex(points.backStart[i], normals.back);
       pushVertex(points.backEnd[i], normals.back);
       pushVertex(points.backStart[n], normals.back);

       pushVertex(points.backEnd[i], normals.back);
       pushVertex(points.backEnd[n], normals.back);
       pushVertex(points.backStart[n], normals.back);

       pushVertex(points.frontStart[i], normals.inward[i]);
       pushVertex(points.backStart[i], normals.inward[i]);
       pushVertex(points.frontStart[n], normals.inward[n]);

       pushVertex(points.backStart[i], normals.inward[i]);
       pushVertex(points.backStart[n], normals.inward[n]);
       pushVertex(points.frontStart[n], normals.inward[n]);

       pushVertex(points.frontEnd[i], normals.outward[i]);
       pushVertex(points.backEnd[i], normals.outward[i]);
       pushVertex(points.frontEnd[n], normals.outward[n]);

       pushVertex(points.backEnd[i], normals.outward[i]);
       pushVertex(points.backEnd[n], normals.outward[n]);
       pushVertex(points.frontEnd[n], normals.outward[n]);
   }

   const numIndices = vertexArray.length / 8;
   let indexArray = Array(numIndices).fill(0).map((_, i) => i);

   return {
       vertices: vertexArray,
       indices: indexArray,
   };
}
