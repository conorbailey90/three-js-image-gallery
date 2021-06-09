uniform sampler2D tDiffuse;

            varying vec2 v_uv;
            void main(){
                vec2 newUV = v_uv;
            
                float area = smoothstep(0.3,0., v_uv.x);
                float area2 = smoothstep(0.7,1., v_uv.x);

                float area3 = smoothstep(0.3,0., v_uv.y);
                float area4 = smoothstep(0.7,1., v_uv.y);

                newUV.y -= (v_uv.y - 0.5) * area * 0.075;
                newUV.y -= (v_uv.y - 0.5)  * area2  * 0.075;
                newUV.y -= (v_uv.y - 0.5) * area3 * 0.1;
                newUV.y -= (v_uv.y - 0.5)  * area4 * 0.1 ;

                gl_FragColor = texture2D(tDiffuse, newUV);
            }
