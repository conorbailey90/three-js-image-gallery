uniform sampler2D tDiffuse;

            varying vec2 v_uv;
            void main(){
                vec2 newUV = v_uv;
            
                float area = smoothstep(0.3,0., v_uv.y);
                float area2 = smoothstep(0.7,1., v_uv.y);

                float area3 = smoothstep(0.3,0., v_uv.x);
                float area4 = smoothstep(0.7,1., v_uv.x);

                area = pow(area, 4.);
                area2 = pow(area2, 4.);
                area3 = pow(area3, 4.);
                area4 = pow(area4, 4.);

                newUV.x -= (v_uv.x - 0.5) * 0.2 * area ;
                newUV.x -= (v_uv.x - 0.5)  * 0.2 * area2;
                newUV.y -= (v_uv.y - 0.5) *  0.2 * area3 ;
                newUV.y -= (v_uv.y - 0.5)  * 0.2 * area4 ;

                gl_FragColor = texture2D(tDiffuse, newUV);
                // gl_FragColor = vec4(area3, 0., 0., 1. );
            }
