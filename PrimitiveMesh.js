import { vec3 } from './GLMatrix/index.js';

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
