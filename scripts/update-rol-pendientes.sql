-- UPDATE ROLs pendientes — referenciales.cl
-- Fuente: catastro SII Valdivia 2025-2
-- Los marcados '-- MANUAL' hay que buscarlos en visor.sii.cl por coordenadas GPS

BEGIN;

-- ✓ ALOJADO (381,000m²) → ROL 2437-7 SII:381m² [EXACTO]
UPDATE referenciales SET rol = '2437-7', "updatedAt" = NOW() WHERE id = 'ref_1774011702099_txq5a5gwx';

-- MANUAL: CAU CAU (150,900m²) GPS:-39.798893,-73.255002
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011702532_higzvqktw';

-- MANUAL: CAYUMAPU (305,400m²) GPS:-39.733716,-73.10946
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011702974_6cjn36bjc';

-- MANUAL: CAYUMAPU LOTE 11 (5,908m²) GPS:-39.708226,-73.06848
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704251_w9jc6lnol';

-- MANUAL: CAYUMAPU LOTE 42 (5,033m²) GPS:-39.711287,-73.067529
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704179_3cvhvdxn4';

-- MANUAL: CAYUMAPU LOTE 43 (5,187m²) GPS:-39.710932,-73.067641
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011705185_s7hgmoq0h';

-- MANUAL: CAYUMAPU LOTE 45 (5,099m²) GPS:-39.71024,-73.067725
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704450_3hspxnte1';

-- MANUAL: CAYUMAPU LOTE 52 (5,111m²) GPS:-39.7079,-73.065826
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011705446_c0ooj9mdn';

-- MANUAL: CAYUMAPU LOTE 54 (5,210m²) GPS:-39.707899,-73.063531
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704197_ikm12sfe8';

-- MANUAL: CAYUMAPU LOTE 55 (6,566m²) GPS:-39.707844,-73.062336
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704359_zhmqbrp8j';

-- MANUAL: CAYUMAPU LOTE 63 (5,060m²) GPS:-39.708849,-73.065786
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704587_9t4mv1f04';

-- MANUAL: CAYUMAPU LOTE 68 (5,156m²) GPS:-39.709489,-73.066848
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704378_o3ev03qyb';

-- MANUAL: CAYUMAPU LOTE 69 (5,273m²) GPS:-39.710022,-73.06675
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704620_1hxg6ig1a';

-- MANUAL: CAYUMAPU LT 3 A (5,340m²) GPS:-39.745462,-73.104448
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011703960_71dxgfu89';

-- MANUAL: CHANCOYAN (103,100m²) GPS:-39.739179,-73.088831
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011703232_cpm7zbmxf';

-- MANUAL: CHINCUIN HJ 11 (5,400m²) GPS:-39.805598,-73.004061
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704853_pfkwabjqp';

-- MANUAL: CUFEO (92,000m²) GPS:-40.000032,-73.009791
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011703160_my4jcy2yx';

-- MANUAL: CURINANCO (145,400m²) GPS:-39.752648,-73.377045
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011702177_oydng8ivr';

-- MANUAL: CURINANCO (24,700m²) GPS:-39.726865,-73.394855
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011701384_kf76027wo';

-- MANUAL: CURINANCO (24,700m²) GPS:-39.726865,-73.394855
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011702406_l4qzchobx';

-- MANUAL: CURINANCO (23,900m²) GPS:-39.71894,-73.397773
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011702938_sn0jd4jti';

-- MANUAL: CURINANCO (63,300m²) GPS:-39.705867,-73.395456
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011703195_k160j4ir5';

-- MANUAL: CURINANCO (22,100m²) GPS:-39.734377,-73.392483
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011703470_k2zjal25i';

-- MANUAL: CURINANCO LT D (5,046m²) GPS:-39.740385,-73.389759
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011705392_knmanhlmc';

-- MANUAL: EL HUAPE SN LT 11 (7,600m²) GPS:-39.864642,-73.134715
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011705203_wgf0d7qxu';

-- MANUAL: EL HUAPE SN LT 15 (5,700m²) GPS:-39.866251,-73.134337
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011705534_5wg6t612q';

-- MANUAL: EL HUAPE SN LT 17 (5,500m²) GPS:-39.867076,-73.134532
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704743_gmavp0hrq';

-- MANUAL: EL HUAPE SN LT 21 (5,000m²) GPS:-39.868819,-73.134249
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704871_qcf8zcdfs';

-- MANUAL: EL HUAPE SN LT 44 (5,100m²) GPS:-39.864488,-73.137688
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704233_qn6q0zvsn';

-- MANUAL: EL HUAPE SN LT 45 (5,000m²) GPS:-39.866445,-73.138979
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704088_n2ydqlwnt';

-- MANUAL: EL HUAPE SN LT 45 (5,100m²) GPS:-39.865109,-73.137399
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011705258_t7hgfu0uk';

-- MANUAL: EL HUAPE SN LT 5 (5,000m²) GPS:-39.862216,-73.137056
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011705517_37ql6iirh';

-- MANUAL: EL HUAPE SN LT 55 (5,100m²) GPS:-39.868196,-73.139107
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704890_wes6pai14';

-- MANUAL: EL HUAPE SN LT 58 (5,000m²) GPS:-39.866903,-73.138873
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011705355_qln2tpver';

-- MANUAL: EL HUAPE SN LT 8 (5,700m²) GPS:-39.863899,-73.136063
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011705240_9m6237at4';

-- MANUAL: GUACAMAYO (350,000m²) GPS:-39.889839,-73.264559
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011702681_a8v2gioax';

-- MANUAL: HIJUELA 00005 (117,000m²) GPS:-39.809992,-73.389662
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011703142_uyzhs28qb';

-- ✓ HIJUELA 00019 (134,900m²) → ROL 2455-18 SII:135m² [EXACTO]
UPDATE referenciales SET rol = '2455-18', "updatedAt" = NOW() WHERE id = 'ref_1774011703582_mwgdq0eab';

-- ✓ HIJUELA 00056 (53,200m²) → ROL 2449-3 SII:52m² [EXACTO]
UPDATE referenciales SET rol = '2449-3', "updatedAt" = NOW() WHERE id = 'ref_1774011702137_lqx4mt3zt';

-- MANUAL: HIJUELA CHINCUIN HJ 9 (5,000m²) GPS:-39.800945,-73.007954
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011703996_jlol1v8gy';

-- MANUAL: HUAPE-PISHUINCO LT 2 -L 16 (5,000m²) GPS:-39.807927,-73.045136
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704058_7yfa05agd';

-- MANUAL: LONCOYEN (121,000m²) GPS:-39.812916,-73.394995
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011702155_h2ogu6nby';

-- MANUAL: LOS COIGUES (15,800m²) GPS:-39.772237,-73.291603
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011701929_davowyn9o';

-- MANUAL: LOS COIGUES (45,100m²) GPS:-39.774281,-73.28829
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011701947_pblzxafpx';

-- MANUAL: LOS GUINDOS (562,000m²) GPS:-39.981148,-73.117001
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011702043_3z28uvrs3';

-- MANUAL: LOS GUINDOS (30,200m²) GPS:-40.00224,-73.087399
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011703013_0l4oqm89d';

-- ✓ LOS MOLINOSSN (180,500m²) → ROL 2454-188 SII:180m² [EXACTO]
UPDATE referenciales SET rol = '2454-188', "updatedAt" = NOW() WHERE id = 'ref_1774011701502_4sne0547e';

-- MANUAL: LOS PELLINES (64,600m²) GPS:-39.758739,-73.355339
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011703178_siwytauyw';

-- MANUAL: LOS PELLINES LT A (30,000m²) GPS:-39.768545,-73.363348
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011702717_m7et9edx0';

-- MANUAL: LOTE 3 LA QUILA (132,400m²) GPS:-39.736408,-73.152601
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011703380_ne4jp7y8i';

-- MANUAL: LOTE 9 COLLICO (42,100m²) GPS:-39.812967,-73.185898
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011701966_o8aligjrs';

-- MANUAL: PCHIHUAPE LT 61 (5,657m²) GPS:-39.736318,-73.126484
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704433_ahksxrzsm';

-- MANUAL: PICHIHUAPE LOTE 67 (10,584m²) GPS:-39.734661,-73.126072
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704910_s1w1penjx';

-- MANUAL: PICHIHUAPE LOTE 83 (5,287m²) GPS:-39.734516,-73.119217
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704928_0ydjh9o5p';

-- MANUAL: PICHIHUAPE LOTE 83 (5,287m²) GPS:-39.734516,-73.119217
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704269_dupl84964';

-- MANUAL: PICHIHUAPE LT 110 (5,349m²) GPS:-39.73343,-73.12426
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011705074_dahw4sbam';

-- MANUAL: PICHIHUAPE LT 6 -C (5,600m²) GPS:-39.742183,-73.126052
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704657_uhacb9oc8';

-- MANUAL: PICHIHUAPE LT 85 (6,571m²) GPS:-39.7332,-73.118876
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011704486_s29g3038r';

-- ✓ POLLICAN (516,000m²) → ROL 2456-23 SII:516m² [EXACTO]
UPDATE referenciales SET rol = '2456-23', "updatedAt" = NOW() WHERE id = 'ref_1774011702917_vm4d9ewcu';

-- MANUAL: POST MARTINEZ TRANSITO JAVIER (20,000m²) GPS:-39.810548,-73.200016
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011702267_ycvqb95tp';

-- MANUAL: TAMBILLO (636,000m²) GPS:-39.704252,-73.221874
-- Buscar en: https://www4.sii.cl/busquedaR/ → Valdivia → coordenadas
-- UPDATE referenciales SET rol = 'X-Y', "updatedAt" = NOW() WHERE id = 'ref_1774011703416_bxzvo8rjx';

COMMIT;