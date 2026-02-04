// 50 Sayfalık Ultra-Detaylı Teknik Veri (V8 - SÜPER FORM)
// GET İşlemi: En Yüksek Görsel Kalite ve Teknik Derinlik
// Proje Kodları, Ham Headerlar, Marshaling ve L2-L7 Analizleri ile Doyurucu İçerik.

// ============================================================================
// GET METODU - SÜPER FORM (10 AŞAMA)
// Her aşama: Ham Header, Paket Analizi, Go Kodu, SQL ve Görsel Zenginlik
// ============================================================================

const getStages = [
    {
        title: "1. GET İsteği: Kaynak Sorgulama Analizi",
        technical: `<strong>RFC 7231 §4.3.1 - GET</strong><br><br>
            <strong>Amaç:</strong> İstemci, sunucudaki bir kaynağın mevcut durumunu talep eder. Projede <code>/api/v1/devices</code> uç noktasına yapılan bu istek, cihaz listesini döndürmeyi hedefler.<br><br>
            <strong>Özellikler:</strong><br>
            - <strong>Safe:</strong> Sunucu durumunu değiştirmez.<br>
            - <strong>Idempotent:</strong> Birden fazla aynı istek sonucu değiştirmez.<br>
            - <strong>Cacheable:</strong> Yanıt önbelleğe alınabilir.<br><br>
            <strong>Proje Endpoint:</strong><br>
            <code>router.HandleFunc("/api/v1/devices", handlers.GetDevices).Methods("GET")</code>`,
        component: `<strong>HTTP İstemci (Request Headers)</strong><br><br>
            <div style="background:#000; padding:15px; border-radius:8px; border:1px solid #333; font-family:'Fira Code', monospace; font-size:0.75rem; line-height:1.6;">
                <span style="color:#50fa7b;">GET</span> /api/v1/devices?vendor=Nokia&status=active HTTP/1.1<br>
                <span style="color:#8be9fd;">Host:</span> localhost:3000<br>
                <span style="color:#8be9fd;">User-Agent:</span> PostmanRuntime/7.32.3<br>
                <span style="color:#8be9fd;">Accept:</span> application/json<br>
                <span style="color:#8be9fd;">Accept-Encoding:</span> gzip, deflate, br<br>
                <span style="color:#8be9fd;">Authorization:</span> Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...<br>
                <span style="color:#8be9fd;">X-Request-ID:</span> dev-550e8400-e29b-41d4-a716-446655440000<br>
                <span style="color:#8be9fd;">Cache-Control:</span> no-cache<br>
                <span style="color:#8be9fd;">Connection:</span> keep-alive
            </div>
            <div style="margin-top:10px; padding:8px; background:rgba(0,173,216,0.1); border-radius:4px; font-size:0.7rem;">
                <strong>cURL Equivalent:</strong><br>
                <code style="color:#f1fa8c;">curl -X GET "http://localhost:3000/api/v1/devices?vendor=Nokia" -H "Authorization: Bearer TOKEN"</code>
            </div>`,
        content: `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 1.2rem; color: var(--primary); font-weight: bold; border: 2px solid var(--primary); padding: 15px 30px; border-radius: 8px; display: inline-block; background: rgba(0,173,216,0.05);">
                    İSTEMCİ -> [ HTTP GET ] -> SUNUCU
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.7rem; color:var(--primary); margin-bottom:10px; font-weight:bold;">QUERY PARAMETERS</div>
                    <table style="width:100%; font-size:0.75rem; border-collapse:collapse;">
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">vendor</td><td style="padding:5px; border-bottom:1px solid #333; color:#f1fa8c;">Nokia</td></tr>
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">status</td><td style="padding:5px; border-bottom:1px solid #333; color:#f1fa8c;">active</td></tr>
                        <tr><td style="padding:5px;">sortby</td><td style="padding:5px; color:#f1fa8c;">hostname</td></tr>
                    </table>
                </div>
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.7rem; color:var(--warning); margin-bottom:10px; font-weight:bold;">TIMING BREAKDOWN</div>
                    <div style="font-size:0.75rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>DNS Lookup:</span><span style="color:#50fa7b;">2.1ms</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>TCP Connect:</span><span style="color:#50fa7b;">4.3ms</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>TLS Handshake:</span><span style="color:#50fa7b;">12.8ms</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>Request Sent:</span><span style="color:#50fa7b;">0.8ms</span></div>
                    </div>
                </div>
            </div>
            
            <div class="code-block">
                <span class="comment">// Proje handler: internal/api/handlers/devices.go -> GetDevices()</span><br>
                <span class="keyword">func</span> <span class="function">GetDevices</span>(w http.ResponseWriter, r *http.Request) {<br>
                &nbsp;&nbsp;w.Header().Set(<span class="string">"Content-Type"</span>, <span class="string">"application/json"</span>)<br>
                &nbsp;&nbsp;<br>
                &nbsp;&nbsp;<span class="comment">// Query parametrelerini oku</span><br>
                &nbsp;&nbsp;filters := <span class="keyword">make</span>(<span class="keyword">map</span>[<span class="keyword">string</span>]<span class="keyword">string</span>)<br>
                &nbsp;&nbsp;queryParams := r.URL.Query()<br>
                &nbsp;&nbsp;<span class="keyword">for</span> k, v := <span class="keyword">range</span> queryParams {<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">if</span> k == <span class="string">"sortby"</span> { <span class="keyword">continue</span> }<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">if</span> len(v) > 0 && v[0] != <span class="string">""</span> {<br>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;filters[k] = v[0]<br>
                &nbsp;&nbsp;&nbsp;&nbsp;}<br>
                &nbsp;&nbsp;}<br>
                &nbsp;&nbsp;sorts := r.URL.Query()[<span class="string">"sortby"</span>]<br>
                &nbsp;&nbsp;...<br>
                }
            </div>
        `,
        progress: 10
    },
    {
        title: "2. OSI Yığını ve Paketleme (Data Encapsulation)",
        technical: `<strong>Veri Yolculuğu (L7 -> L2):</strong><br><br>
            HTTP isteği, OSI katmanlarında aşağıya doğru sarmalanarak fiziksel ortama hazırlanır:<br><br>
            - <strong>L7 Application:</strong> HTTP isteği metin olarak hazırdır.<br>
            - <strong>L4 Transport:</strong> TCP segmenti oluşturulur (Port 3000).<br>
            - <strong>L3 Network:</strong> IP paketi (Source: 192.168.1.5, Dest: 127.0.0.1).<br>
            - <strong>L2 Data Link:</strong> Ethernet çerçevesi (Preamble, MAC, CRC).<br><br>
            <strong>MTU:</strong> 1500 bytes | <strong>MSS:</strong> 1460 bytes`,
        component: `<strong>Network Interface Card (NIC)</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--warning); margin-bottom:8px;">PAKET BOYUTLARI</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Ethernet Header:</td><td style="padding:3px; color:#8be9fd; text-align:right;">14 bytes</td></tr>
                    <tr><td style="padding:3px;">IP Header:</td><td style="padding:3px; color:#8be9fd; text-align:right;">20 bytes</td></tr>
                    <tr><td style="padding:3px;">TCP Header:</td><td style="padding:3px; color:#8be9fd; text-align:right;">32 bytes</td></tr>
                    <tr><td style="padding:3px;">HTTP Payload:</td><td style="padding:3px; color:#50fa7b; text-align:right;">256 bytes</td></tr>
                    <tr style="border-top:1px solid #333;"><td style="padding:3px;"><strong>Toplam:</strong></td><td style="padding:3px; color:var(--primary); text-align:right;"><strong>322 bytes</strong></td></tr>
                </table>
            </div>`,
        content: `
            <div class="packet visible" style="border: 2px solid var(--primary); padding: 15px; border-radius: 10px; background: rgba(0,173,216,0.05);">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05); width:120px;"><strong>FRAME (L2)</strong></td><td style="border: 1px solid #444; padding: 8px;">Dest MAC: <span style="color:#8be9fd;">00:50:56:C0:00:08</span> | Src MAC: <span style="color:#8be9fd;">44:37:E6:32:A1:B2</span> | EtherType: 0x0800</td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05);"><strong>PACKET (L3)</strong></td><td style="border: 1px solid #444; padding: 8px;">Src IP: <span style="color:#50fa7b;">192.168.1.10</span> | Dest IP: <span style="color:#50fa7b;">127.0.0.1</span> | TTL: 64 | Protocol: TCP(6)</td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05);"><strong>SEGMENT (L4)</strong></td><td style="border: 1px solid #444; padding: 8px;">Src Port: <span style="color:#f1fa8c;">54321</span> | Dest Port: <span style="color:#f1fa8c;">3000</span> | Seq: 1001 | Ack: 1 | Flags: <span style="color:#ff79c6;">[PSH, ACK]</span></td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(0,173,216,0.2);"><strong>PAYLOAD (L7)</strong></td><td style="border: 1px solid #444; padding: 8px;">GET /api/v1/devices?vendor=Nokia HTTP/1.1\\r\\n...</td></tr>
                </table>
            </div>
            
            <div style="margin-top:15px; background:#000; padding:10px; border-radius:5px; font-family:monospace; font-size:0.6rem; color:#666;">
                <div style="color:var(--primary); margin-bottom:5px;">HEX DUMP (İlk 48 byte):</div>
                <div style="line-height:1.4;">
                    0000: <span style="color:#8be9fd;">00 50 56 c0 00 08</span> <span style="color:#f1fa8c;">44 37 e6 32 a1 b2</span> <span style="color:#50fa7b;">08 00</span> 45 00<br>
                    0010: 00 42 1c 46 40 00 40 06 00 00 c0 a8 01 0a 7f 00<br>
                    0020: 00 01 d4 31 0b b8 00 00 03 e9 00 00 00 01 50 18
                </div>
            </div>
            
            <div style="margin-top:10px; text-align:center; font-size:0.75rem; color:var(--success);">[ CHECKSUM DOĞRULANDI - CRC32: 0x4A3B2C1D ]</div>
        `,
        progress: 20
    },
    {
        title: "3. TLS 1.3: Güvenli Kanal Aktarımı",
        technical: `<strong>Şifreleme Süreci:</strong><br><br>
            Go http-server, <code>ListenAndServeTLS</code> modunda çalıştığı için istemciyle TLS 1.3 el sıkışması yapar.<br><br>
            - <strong>Cipher Suite:</strong> <code>TLS_AES_256_GCM_SHA384</code><br>
            - <strong>Key Exchange:</strong> ECDHE (X25519)<br>
            - <strong>Authentication:</strong> RSA-PSS (2048-bit)<br>
            - <strong>Forward Secrecy:</strong> Etkin<br><br>
            <strong>Go Config:</strong><br>
            <code>tls.Config{MinVersion: tls.VersionTLS13}</code>`,
        component: `<strong>Cyber-Security Layer (TLS/SSL)</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--success); margin-bottom:8px;">SERTİFİKA BİLGİLERİ</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Subject:</td><td style="padding:3px; color:#8be9fd;">CN=localhost</td></tr>
                    <tr><td style="padding:3px;">Issuer:</td><td style="padding:3px; color:#8be9fd;">O=REST-API Dev CA</td></tr>
                    <tr><td style="padding:3px;">Valid Until:</td><td style="padding:3px; color:#50fa7b;">2027-02-04</td></tr>
                    <tr><td style="padding:3px;">Key Size:</td><td style="padding:3px; color:#f1fa8c;">2048-bit RSA</td></tr>
                </table>
            </div>`,
        content: `
            <div style="text-align: center; margin: 20px 0;">
                <div style="padding: 20px 40px; border: 3px solid var(--success); border-radius: 50px; background: rgba(16,185,129,0.1); display: inline-block;">
                    <span style="color: var(--success); font-weight: bold; letter-spacing: 3px; font-size:1.1rem;">ENCRYPTED TLS 1.3 TUNNEL</span>
                </div>
            </div>
            
            <div style="background:#000; padding:15px; border-radius:8px; border:1px solid #333; margin-bottom:15px;">
                <div style="color:var(--primary); font-size:0.75rem; margin-bottom:10px; font-weight:bold;">TLS HANDSHAKE AKIŞI</div>
                <div style="display:flex; align-items:center; gap:5px; font-size:0.7rem; flex-wrap:wrap;">
                    <span style="padding:5px 10px; background:rgba(0,173,216,0.1); border:1px solid var(--primary); border-radius:4px;">ClientHello</span>
                    <span style="color:#50fa7b;">-></span>
                    <span style="padding:5px 10px; background:rgba(245,158,11,0.1); border:1px solid var(--warning); border-radius:4px;">ServerHello</span>
                    <span style="color:#50fa7b;">-></span>
                    <span style="padding:5px 10px; background:rgba(255,121,198,0.1); border:1px solid #ff79c6; border-radius:4px;">Certificate</span>
                    <span style="color:#50fa7b;">-></span>
                    <span style="padding:5px 10px; background:rgba(16,185,129,0.1); border:1px solid var(--success); border-radius:4px;">Finished</span>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Handshake Time</div>
                    <div style="font-size:1rem; color:var(--success);">12.8ms</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Session Resumed</div>
                    <div style="font-size:1rem; color:var(--warning);">No</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">ALPN Protocol</div>
                    <div style="font-size:1rem; color:#8be9fd;">h2, http/1.1</div>
                </div>
            </div>
        `,
        progress: 30
    },
    {
        title: "4. Sunucu Girişi ve Goroutine Tahsisi",
        technical: `<strong>Go net/http Runtime:</strong><br><br>
            OS çekirdeği veri paketini dinleyen porta (3000) iletir. Go sunucusu yeni bağlantıyı (Accept) alır ve her istek için düşük maliyetli (2KB stack) bir <code>Goroutine</code> başlatır.<br><br>
            <strong>Scheduler:</strong> M:N (Multiplexing)<br>
            <strong>GOMAXPROCS:</strong> 8 (CPU cores)<br>
            <strong>Stack Size:</strong> 2KB (growable)`,
        component: `<strong>Go Runtime (M:N Scheduler)</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--primary); margin-bottom:8px;">GOROUTINE HAVUZU</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Active Goroutines:</td><td style="padding:3px; color:#50fa7b; text-align:right;">47</td></tr>
                    <tr><td style="padding:3px;">Idle Goroutines:</td><td style="padding:3px; color:#8be9fd; text-align:right;">12</td></tr>
                    <tr><td style="padding:3px;">Peak:</td><td style="padding:3px; color:#f1fa8c; text-align:right;">128</td></tr>
                    <tr><td style="padding:3px;">GC Runs:</td><td style="padding:3px; color:#ff79c6; text-align:right;">3</td></tr>
                </table>
            </div>`,
        content: `
            <div style="display: flex; justify-content: center; gap: 20px; align-items: center; margin-bottom: 20px;">
                <div style="width: 70px; height: 70px; background: linear-gradient(135deg, var(--primary), #00d4ff); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px var(--primary); font-weight:bold; font-size:1.1rem;">GO</div>
                <div style="flex: 1; max-width:150px; border-top: 3px dashed var(--primary); position:relative;">
                    <div style="position:absolute; top:-8px; left:50%; transform:translateX(-50%); background:#0d0d0d; padding:0 5px; font-size:0.6rem; color:#666;">spawn</div>
                </div>
                <div style="padding: 15px 20px; border: 2px solid var(--success); border-radius: 8px; background: rgba(16,185,129,0.1);">
                    <div style="font-size:0.7rem; color:#666;">goroutine</div>
                    <div style="color:var(--success); font-weight:bold;">#4102</div>
                </div>
            </div>
            
            <div class="code-block">
                <span class="comment">// Go net/http internal server loop</span><br>
                <span class="keyword">func</span> (srv *Server) <span class="function">Serve</span>(l net.Listener) error {<br>
                &nbsp;&nbsp;<span class="keyword">for</span> {<br>
                &nbsp;&nbsp;&nbsp;&nbsp;rw, err := l.<span class="function">Accept</span>() <span class="comment">// Blocking syscall</span><br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">if</span> err != nil { <span class="keyword">return</span> err }<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="comment">// Her istek için yeni goroutine (lightweight thread)</span><br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">go</span> srv.<span class="function">handleRequest</span>(rw)<br>
                &nbsp;&nbsp;}<br>
                }
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px;">
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Spawn Time</div>
                    <div style="font-size:1rem; color:var(--success);">0.003ms</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Memory Allocated</div>
                    <div style="font-size:1rem; color:var(--primary);">2.1KB</div>
                </div>
            </div>
        `,
        progress: 40
    },
    {
        title: "5. Gorilla Mux: Rota ve Patterns",
        technical: `<strong>Router Mantığı:</strong><br><br>
            Projedeki <code>router.go</code> içerisinde tanımlanan <code>/api/v1/devices</code> yolu, metot bazlı olarak denetlenir.<br><br>
            - <strong>Algorithm:</strong> Trie-based matching<br>
            - <strong>Path Variables:</strong> <code>{id}</code> destekli<br>
            - <strong>Method Filter:</strong> GET, POST, PUT, PATCH, DELETE<br><br>
            <strong>Proje Tanımı:</strong><br>
            <code>r.HandleFunc("/api/v1/devices", GetDevices).Methods("GET")</code>`,
        component: `<strong>MUX Internal Tree</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--warning); margin-bottom:8px;">ROUTER İSTATİSTİKLERİ</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Registered Routes:</td><td style="padding:3px; color:#50fa7b; text-align:right;">24</td></tr>
                    <tr><td style="padding:3px;">Middleware Count:</td><td style="padding:3px; color:#8be9fd; text-align:right;">5</td></tr>
                    <tr><td style="padding:3px;">Match Time:</td><td style="padding:3px; color:#f1fa8c; text-align:right;">0.02ms</td></tr>
                </table>
            </div>`,
        content: `
            <div style="background: #000; padding: 20px; border-radius: 10px; border: 1px solid #333;">
                <div style="font-size: 0.8rem; margin-bottom: 15px; border-bottom: 1px solid #222; padding-bottom: 8px; color: var(--primary); font-weight:bold;">MUX ROUTING TABLE (devices)</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display:flex; justify-content:space-between; padding: 8px 12px; background: rgba(255,121,198,0.1); border-radius: 4px; color: #ff79c6;">
                        <span>POST /api/v1/devices</span><span style="opacity:0.6;">[SKIP]</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding: 10px 12px; background: rgba(80,250,123,0.15); border: 2px solid #50fa7b; border-radius: 4px; color: #50fa7b; font-weight: bold;">
                        <span>GET /api/v1/devices</span><span>[EŞLEŞTİ]</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding: 8px 12px; background: rgba(139,233,253,0.1); border-radius: 4px; color: #8be9fd;">
                        <span>GET /api/v1/devices/{id}</span><span style="opacity:0.6;">[SKIP]</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding: 8px 12px; background: rgba(245,158,11,0.1); border-radius: 4px; color: var(--warning);">
                        <span>PUT /api/v1/devices/{id}</span><span style="opacity:0.6;">[SKIP]</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding: 8px 12px; background: rgba(239,68,68,0.1); border-radius: 4px; color: var(--danger);">
                        <span>DELETE /api/v1/devices/{id}</span><span style="opacity:0.6;">[SKIP]</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-top:15px; padding:10px; background:rgba(80,250,123,0.1); border:1px solid #50fa7b; border-radius:5px; text-align:center; font-size:0.8rem;">
                <span style="color:#50fa7b;">Handler Matched:</span> <code style="color:#f1fa8c;">handlers.GetDevices</code>
            </div>
        `,
        progress: 50
    },
    {
        title: "6. Middleware Pipeline (Middleware Chain)",
        technical: `<strong>Ara Katman Güvenliği:</strong><br><br>
            İstek "Onion" mimarisiyle işlenir. Projedeki <code>middlewares/chain.go</code>:<br><br>
            - <strong>RequestID:</strong> Her isteğe benzersiz UUID atar<br>
            - <strong>Logger:</strong> x-request-id ile iz sürücü (tracing)<br>
            - <strong>Auth:</strong> JWT Bearer token doğrulaması<br>
            - <strong>Security:</strong> HSTS, CSP, X-Frame-Options<br>
            - <strong>CORS:</strong> Cross-Origin politikaları`,
        component: `<strong>Middleware Pipeline</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--warning); margin-bottom:8px;">EKLENEN HEADERLAR</div>
                <table style="width:100%; font-size:0.6rem;">
                    <tr><td style="padding:2px; color:#8be9fd;">X-Request-ID:</td><td style="padding:2px;">req_550e8400...</td></tr>
                    <tr><td style="padding:2px; color:#8be9fd;">X-Content-Type-Options:</td><td style="padding:2px;">nosniff</td></tr>
                    <tr><td style="padding:2px; color:#8be9fd;">X-Frame-Options:</td><td style="padding:2px;">DENY</td></tr>
                    <tr><td style="padding:2px; color:#8be9fd;">Strict-Transport-Security:</td><td style="padding:2px;">max-age=31536000</td></tr>
                </table>
            </div>`,
        content: `
            <div style="padding: 20px; text-align: center;">
                <div style="font-size:0.7rem; color:#666; margin-bottom:15px;">ONION ARCHITECTURE (Dış -> İç)</div>
                
                <div style="border: 2px solid var(--primary); padding: 15px; border-radius: 50px; margin-bottom: 8px; background: rgba(0,173,216,0.05);">
                    <span style="color:var(--primary); font-size:0.8rem;">1. RequestID Middleware</span>
                    <span style="float:right; font-size:0.65rem; color:#666;">0.01ms</span>
                </div>
                <div style="border: 2px solid #8be9fd; padding: 15px; border-radius: 50px; margin-bottom: 8px; background: rgba(139,233,253,0.05); margin-left:20px; margin-right:20px;">
                    <span style="color:#8be9fd; font-size:0.8rem;">2. Logger Middleware</span>
                    <span style="float:right; font-size:0.65rem; color:#666;">0.02ms</span>
                </div>
                <div style="border: 2px solid var(--warning); padding: 15px; border-radius: 50px; margin-bottom: 8px; background: rgba(245,158,11,0.05); margin-left:40px; margin-right:40px;">
                    <span style="color:var(--warning); font-size:0.8rem;">3. Auth: JWT Verified</span>
                    <span style="float:right; font-size:0.65rem; color:#666;">0.15ms</span>
                </div>
                <div style="border: 3px solid var(--success); padding: 15px; border-radius: 50px; background: rgba(16,185,129,0.15); margin-left:60px; margin-right:60px;">
                    <span style="color:var(--success); font-size:0.9rem; font-weight:bold;">HANDLER: GetDevices()</span>
                </div>
            </div>
            
            <div class="code-block" style="font-size: 0.75rem; margin-top:15px;">
                <span class="comment">// middlewares/chain.go - Proje kodu</span><br>
                <span class="keyword">func</span> (c *Chain) <span class="function">Then</span>(h http.Handler) http.Handler {<br>
                &nbsp;&nbsp;<span class="keyword">for</span> i := <span class="keyword">len</span>(c.middlewares) - 1; i >= 0; i-- {<br>
                &nbsp;&nbsp;&nbsp;&nbsp;h = c.middlewares[i](h) <span class="comment">// Wrap handler</span><br>
                &nbsp;&nbsp;}<br>
                &nbsp;&nbsp;<span class="keyword">return</span> h<br>
                }
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:15px;">
                <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Total Overhead</div>
                    <div style="font-size:0.9rem; color:var(--success);">0.18ms</div>
                </div>
                <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">User Context</div>
                    <div style="font-size:0.9rem; color:#8be9fd;">admin_01</div>
                </div>
                <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Auth Status</div>
                    <div style="font-size:0.9rem; color:var(--success);">VALID</div>
                </div>
            </div>
        `,
        progress: 65
    },
    {
        title: "7. SQL Sorgusu ve Performans (PostgreSQL)",
        technical: `<strong>Veri Erişimi (DAO/Repository):</strong><br><br>
            <code>GetDevices</code> handler'ı, repository katmanına filtreleri iletir. PostgreSQL üzerinde indeksli sorgu çalıştırılır.<br><br>
            <strong>Tablo:</strong> <code>devices</code><br>
            <strong>İndeks:</strong> <code>idx_devices_vendor</code><br>
            <strong>Connection Pool:</strong> <code>max_connections=100</code><br><br>
            <strong>Proje Repository:</strong><br>
            <code>deviceRepo := sqlconnect.NewDeviceRepository(db)</code>`,
        component: `<strong>PostgreSQL 15 Core</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem; margin-top:10px;">
                <div style="color:var(--primary); margin-bottom:8px;">TABLO ŞEMASI</div>
                <table style="width:100%; border-collapse:collapse; font-size:0.65rem;">
                    <tr style="background:rgba(255,255,255,0.05);"><th style="padding:4px; text-align:left; border:1px solid #333;">Kolon</th><th style="padding:4px; text-align:left; border:1px solid #333;">Tip</th><th style="padding:4px; text-align:left; border:1px solid #333;">Constraint</th></tr>
                    <tr><td style="padding:4px; border:1px solid #333;">id</td><td style="padding:4px; border:1px solid #333; color:#8be9fd;">UUID</td><td style="padding:4px; border:1px solid #333; color:#f1fa8c;">PRIMARY KEY</td></tr>
                    <tr><td style="padding:4px; border:1px solid #333;">hostname</td><td style="padding:4px; border:1px solid #333; color:#8be9fd;">VARCHAR(255)</td><td style="padding:4px; border:1px solid #333; color:#f1fa8c;">NOT NULL</td></tr>
                    <tr><td style="padding:4px; border:1px solid #333;">ip</td><td style="padding:4px; border:1px solid #333; color:#8be9fd;">INET</td><td style="padding:4px; border:1px solid #333;">-</td></tr>
                    <tr><td style="padding:4px; border:1px solid #333;">vendor</td><td style="padding:4px; border:1px solid #333; color:#8be9fd;">VARCHAR(100)</td><td style="padding:4px; border:1px solid #333; color:#50fa7b;">INDEXED</td></tr>
                    <tr><td style="padding:4px; border:1px solid #333;">status</td><td style="padding:4px; border:1px solid #333; color:#8be9fd;">VARCHAR(50)</td><td style="padding:4px; border:1px solid #333;">-</td></tr>
                </table>
            </div>`,
        content: `
            <div class="db-query" style="padding: 20px;">
                <div style="margin-bottom:10px; color:var(--primary); font-size:0.8rem; font-weight:bold;">SQL QUERY</div>
                <span class="sql-keyword">SELECT</span> id, hostname, ip, vendor, status, model, os, serial_number<br>
                <span class="sql-keyword">FROM</span> devices<br>
                <span class="sql-keyword">WHERE</span> vendor = $1 <span class="sql-keyword">AND</span> status = $2<br>
                <span class="sql-keyword">ORDER BY</span> hostname <span class="sql-keyword">ASC</span>;<br><br>
                
                <div style="border-top: 1px solid #444; margin-top: 15px; padding-top: 15px;">
                    <div style="color:#f1fa8c; margin-bottom:10px; font-weight:bold;">EXPLAIN ANALYZE:</div>
                    <div style="font-size: 0.75rem; color: #6272a4; line-height:1.6;">
                        -> Index Scan using idx_devices_vendor on devices<br>
                        &nbsp;&nbsp;&nbsp;(cost=0.28..8.30 rows=1 width=328)<br>
                        &nbsp;&nbsp;&nbsp;Index Cond: (vendor = 'Nokia'::text)<br>
                        &nbsp;&nbsp;&nbsp;Filter: (status = 'active'::text)<br>
                        &nbsp;&nbsp;&nbsp;Rows Removed by Filter: 0<br>
                        &nbsp;&nbsp;&nbsp;Buffers: shared hit=4
                    </div>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:15px;">
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.65rem; color:#666;">Planning Time</div>
                    <div style="font-size:1.2rem; color:var(--success); font-weight:bold;">0.082ms</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.65rem; color:#666;">Execution Time</div>
                    <div style="font-size:1.2rem; color:var(--success); font-weight:bold;">0.045ms</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.65rem; color:#666;">Rows Returned</div>
                    <div style="font-size:1.2rem; color:var(--primary); font-weight:bold;">12</div>
                </div>
            </div>
        `,
        progress: 75
    },
    {
        title: "8. JSON Marshaling (Struct -> String)",
        technical: `<strong>Veri Serileştirme:</strong><br><br>
            Veritabanından gelen satırlar <code>sql.Scan</code> ile Go struct'larına (<code>models.Device</code>) doldurulur. Ardından <code>json.NewEncoder</code> ile HTTP response stream'ine aktarılır.<br><br>
            <strong>Proje Encoding:</strong><br>
            <code>json.NewEncoder(w).Encode(response)</code><br><br>
            <strong>Performans:</strong><br>
            - Reflection-based mapping<br>
            - Zero-copy streaming`,
        component: `<strong>Marshaling Engine (encoding/json)</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--warning); margin-bottom:8px;">DÖNÜŞÜM SÜRECİ</div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="padding:5px 10px; background:rgba(0,173,216,0.1); border:1px solid var(--primary); border-radius:4px;">models.Device</div>
                    <div style="color:#50fa7b;">-></div>
                    <div style="padding:5px 10px; background:rgba(245,158,11,0.1); border:1px solid var(--warning); border-radius:4px;">[]byte</div>
                    <div style="color:#50fa7b;">-></div>
                    <div style="padding:5px 10px; background:rgba(16,185,129,0.1); border:1px solid var(--success); border-radius:4px;">HTTP Body</div>
                </div>
            </div>`,
        content: `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.75rem; color:var(--primary); margin-bottom:10px; font-weight:bold;">GO STRUCT (models.Device)</div>
                    <pre style="font-size:0.65rem; margin:0; line-height:1.5;"><span style="color:#ff79c6;">type</span> Device <span style="color:#ff79c6;">struct</span> {
  ID          <span style="color:#8be9fd;">string</span>    <span style="color:#f1fa8c;">\`json:"id"\`</span>
  Hostname    <span style="color:#8be9fd;">string</span>    <span style="color:#f1fa8c;">\`json:"hostname"\`</span>
  IP          <span style="color:#8be9fd;">string</span>    <span style="color:#f1fa8c;">\`json:"ip"\`</span>
  Vendor      <span style="color:#8be9fd;">string</span>    <span style="color:#f1fa8c;">\`json:"vendor"\`</span>
  Status      <span style="color:#8be9fd;">string</span>    <span style="color:#f1fa8c;">\`json:"status"\`</span>
  Model       <span style="color:#8be9fd;">string</span>    <span style="color:#f1fa8c;">\`json:"model"\`</span>
  CreatedAt   <span style="color:#8be9fd;">time.Time</span> <span style="color:#f1fa8c;">\`json:"created_at"\`</span>
}</pre>
                </div>
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.75rem; color:var(--warning); margin-bottom:10px; font-weight:bold;">JSON OUTPUT</div>
                    <pre style="font-size:0.65rem; margin:0; line-height:1.5;">{
  <span style="color:#ff79c6;">"id"</span>: <span style="color:#f1fa8c;">"550e8400-e29b..."</span>,
  <span style="color:#ff79c6;">"hostname"</span>: <span style="color:#f1fa8c;">"IST-RTR-01"</span>,
  <span style="color:#ff79c6;">"ip"</span>: <span style="color:#f1fa8c;">"10.20.30.1"</span>,
  <span style="color:#ff79c6;">"vendor"</span>: <span style="color:#f1fa8c;">"Nokia"</span>,
  <span style="color:#ff79c6;">"status"</span>: <span style="color:#f1fa8c;">"active"</span>,
  <span style="color:#ff79c6;">"model"</span>: <span style="color:#f1fa8c;">"SR-7750"</span>,
  <span style="color:#ff79c6;">"created_at"</span>: <span style="color:#f1fa8c;">"2026-02-04T..."</span>
}</pre>
                </div>
            </div>
            
            <div style="margin-top:15px; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div style="background:rgba(0,173,216,0.1); padding:10px; border:1px solid var(--primary); border-radius:5px; text-align:center;">
                    <div style="font-size:0.7rem; color:#666;">Serialization Time</div>
                    <div style="font-size:1rem; color:var(--primary); font-weight:bold;">0.12ms</div>
                </div>
                <div style="background:rgba(16,185,129,0.1); padding:10px; border:1px solid var(--success); border-radius:5px; text-align:center;">
                    <div style="font-size:0.7rem; color:#666;">Field Mapping</div>
                    <div style="font-size:1rem; color:var(--success); font-weight:bold;">100% Match</div>
                </div>
            </div>
        `,
        progress: 85
    },
    {
        title: "9. Yanıt Başlıkları ve Durum Kodu",
        technical: `<strong>HTTP Response:</strong><br><br>
            Başarıyla işlenen istek için 200 OK yanıtı hazırlanır. Headers katmanı: <br><br>
            - <code>Content-Type: application/json</code><br>
            - <code>Server: Net-Engine/1.0</code><br>
            - <code>X-Request-ID: ...</code>`,
        component: `<strong>HTTP Response Writer</strong>`,
        content: `
            <div style="background:#000; padding:15px; border-radius:8px; border:1px solid #333; font-family:monospace; font-size:0.75rem;">
                <span style="color:#50fa7b;">HTTP/1.1 200 OK</span><br>
                Date: Wed, 05 Feb 2026 12:00:00 GMT<br>
                Content-Type: application/json; charset=utf-8<br>
                Content-Length: 1024<br>
                Vary: Accept-Encoding<br>
                Cache-Control: private, max-age=0<br>
                X-Response-Time: 12.4ms
            </div>
        `,
        progress: 95
    },
    {
        title: "10. İstemciye Teslimat ve Bağlantı Kapanışı",
        technical: `<strong>Sürecin Sonu:</strong><br><br>
            Veri paketleri NIC kartından kablolara elektrik sinyalleri olarak (L1) aktarılır. İstemci JSON verisini parse ederek UI'da görüntüler. <code>Keep-Alive</code> sayesinde bağlantı bir sonraki istek için havuzda (pool) bekler.<br><br>
            <strong>Bağlantı Durumu:</strong><br>
            - TCP State: ESTABLISHED<br>
            - Keep-Alive: Enabled (timeout: 60s)`,
        component: `<strong>End-to-End Complete</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--success); margin-bottom:8px;">YAŞAM DÖNGÜSÜ ÖZETİ</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Total Latency:</td><td style="padding:3px; color:#50fa7b; text-align:right;">24.6ms</td></tr>
                    <tr><td style="padding:3px;">Network:</td><td style="padding:3px; color:#8be9fd; text-align:right;">19.2ms</td></tr>
                    <tr><td style="padding:3px;">Server Processing:</td><td style="padding:3px; color:#f1fa8c; text-align:right;">5.4ms</td></tr>
                </table>
            </div>`,
        content: `
            <div style="text-align: center; padding: 30px; background: rgba(16,185,129,0.05); border: 2px solid var(--success); border-radius: 15px;">
                <div style="font-size: 3rem; color: var(--success); font-weight: bold; margin-bottom: 15px;">200 OK</div>
                <div style="font-size: 1.2rem; color: rgba(255,255,255,0.8); margin-bottom: 20px;">GET İSTEĞİ BAŞARIYLA TAMAMLANDI</div>
                
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-top:20px;">
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Toplam Süre</div>
                        <div style="font-size:1rem; color:var(--primary);">24.6ms</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Veri Boyutu</div>
                        <div style="font-size:1rem; color:var(--warning);">1.2KB</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Kayıt Sayısı</div>
                        <div style="font-size:1rem; color:var(--success);">12</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">DB Sorgusu</div>
                        <div style="font-size:1rem; color:#8be9fd;">0.05ms</div>
                    </div>
                </div>
                
                <div style="margin-top: 25px; font-size: 0.8rem; opacity: 0.6;">[ Sistem yeni istekler için beklemede ]</div>
            </div>
        `,
        progress: 100
    }
];

// --- POST METODU (10 Aşama - CreateDevice) ---
const postStages = [
    {
        title: "1. POST İsteği: Yeni Kaynak Talebi",
        technical: `<strong>RFC 7231 §4.3.3 - POST</strong><br><br>
            POST metodu, sunucuda yeni bir kaynak oluşturmak için kullanılır.<br><br>
            <strong>Özellikler:</strong><br>
            - <strong>Non-Idempotent:</strong> Aynı istek mükerrer kayıt oluşturabilir<br>
            - <strong>Cacheable:</strong> Hayır (genellikle)<br>
            - <strong>Body:</strong> Zorunlu (yeni kaynak verisi)<br><br>
            <strong>Proje Endpoint:</strong><br>
            <code>router.HandleFunc("/api/v1/devices", handlers.CreateDevice).Methods("POST")</code>`,
        component: `<strong>POST Request Headers & Body</strong><br><br>
            <div style="background:#000; padding:12px; border-radius:8px; border:1px solid #333; font-family:monospace; font-size:0.7rem; line-height:1.5;">
                <span style="color:#ff79c6;">POST</span> /api/v1/devices HTTP/1.1<br>
                <span style="color:#8be9fd;">Host:</span> localhost:3000<br>
                <span style="color:#8be9fd;">Content-Type:</span> application/json<br>
                <span style="color:#8be9fd;">Content-Length:</span> 156<br>
                <span style="color:#8be9fd;">Authorization:</span> Bearer eyJhbGciOiJIUzI1NiIs...<br>
                <span style="color:#8be9fd;">X-Request-ID:</span> post-550e8400-e29b-41d4...
            </div>`,
        content: `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 1.2rem; color: #ff79c6; font-weight: bold; border: 2px solid #ff79c6; padding: 15px 30px; border-radius: 8px; display: inline-block; background: rgba(255,121,198,0.05);">
                    İSTEMCİ -> [ HTTP POST + BODY ] -> SUNUCU
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.7rem; color:#ff79c6; margin-bottom:10px; font-weight:bold;">REQUEST BODY FIELDS</div>
                    <table style="width:100%; font-size:0.75rem; border-collapse:collapse;">
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">hostname</td><td style="padding:5px; border-bottom:1px solid #333; color:#f1fa8c;">IST-RTR-01</td></tr>
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">ip</td><td style="padding:5px; border-bottom:1px solid #333; color:#f1fa8c;">10.20.30.1</td></tr>
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">vendor</td><td style="padding:5px; border-bottom:1px solid #333; color:#f1fa8c;">Nokia</td></tr>
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">model</td><td style="padding:5px; border-bottom:1px solid #333; color:#f1fa8c;">SR-7750</td></tr>
                        <tr><td style="padding:5px;">status</td><td style="padding:5px; color:#f1fa8c;">active</td></tr>
                    </table>
                </div>
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.7rem; color:var(--warning); margin-bottom:10px; font-weight:bold;">TIMING BREAKDOWN</div>
                    <div style="font-size:0.75rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>DNS Lookup:</span><span style="color:#50fa7b;">2.1ms</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>TCP Connect:</span><span style="color:#50fa7b;">4.3ms</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>TLS Handshake:</span><span style="color:#50fa7b;">12.8ms</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>Request Sent:</span><span style="color:#50fa7b;">1.2ms</span></div>
                    </div>
                </div>
            </div>
            
            <div style="background:#000; padding:15px; border-radius:8px; border:1px solid #333; font-family:monospace; font-size:0.75rem;">
                <div style="color:#ff79c6; margin-bottom:10px; font-weight:bold;">REQUEST BODY (JSON)</div>
                {<br>
                &nbsp;&nbsp;<span style="color:#50fa7b;">"hostname"</span>: <span style="color:#f1fa8c;">"IST-RTR-01"</span>,<br>
                &nbsp;&nbsp;<span style="color:#50fa7b;">"ip"</span>: <span style="color:#f1fa8c;">"10.20.30.1"</span>,<br>
                &nbsp;&nbsp;<span style="color:#50fa7b;">"vendor"</span>: <span style="color:#f1fa8c;">"Nokia"</span>,<br>
                &nbsp;&nbsp;<span style="color:#50fa7b;">"model"</span>: <span style="color:#f1fa8c;">"SR-7750"</span>,<br>
                &nbsp;&nbsp;<span style="color:#50fa7b;">"status"</span>: <span style="color:#f1fa8c;">"active"</span><br>
                }
            </div>
            
            <div style="margin-top:10px; padding:8px; background:rgba(255,121,198,0.1); border-radius:4px; font-size:0.7rem;">
                <strong>cURL Equivalent:</strong><br>
                <code style="color:#f1fa8c;">curl -X POST "http://localhost:3000/api/v1/devices" -H "Content-Type: application/json" -d '{"hostname":"IST-RTR-01",...}'</code>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:15px;">
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Body Size</div>
                    <div style="font-size:1rem; color:#ff79c6;">156 bytes</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Content-Type</div>
                    <div style="font-size:0.8rem; color:#8be9fd;">application/json</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Method</div>
                    <div style="font-size:1rem; color:#ff79c6;">POST</div>
                </div>
            </div>
        `,
        progress: 10
    },
    {
        title: "2. Veri Paketleme ve L4-TCP Stream",
        technical: `<strong>TCP Segmentasyonu:</strong><br><br>
            POST gövdesi (Body) büyük olabileceği için TCP katmanında birden fazla segmente (MTU 1500) bölünerek iletilir.<br><br>
            <strong>Akış Kontrolü:</strong><br>
            - Window Size: 65535 bytes<br>
            - Nagle Algorithm: Disabled (latency)<br>
            - Push Flag: Enabled`,
        component: `<strong>TCP Stream Management</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--warning); margin-bottom:8px;">SEGMENT BİLGİLERİ</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Total Segments:</td><td style="padding:3px; color:#50fa7b; text-align:right;">1</td></tr>
                    <tr><td style="padding:3px;">Payload Size:</td><td style="padding:3px; color:#8be9fd; text-align:right;">156 bytes</td></tr>
                    <tr><td style="padding:3px;">Sequence Number:</td><td style="padding:3px; color:#f1fa8c; text-align:right;">1001</td></tr>
                </table>
            </div>`,
        content: `
            <div class="packet visible" style="border: 2px solid #ff79c6; padding: 15px; border-radius: 10px; background: rgba(255,121,198,0.05);">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05); width:120px;"><strong>FRAME (L2)</strong></td><td style="border: 1px solid #444; padding: 8px;">Dest MAC: <span style="color:#8be9fd;">00:50:56:C0:00:08</span> | Src MAC: <span style="color:#8be9fd;">44:37:E6:32:A1:B2</span> | EtherType: 0x0800</td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05);"><strong>PACKET (L3)</strong></td><td style="border: 1px solid #444; padding: 8px;">Src IP: <span style="color:#50fa7b;">192.168.1.10</span> | Dest IP: <span style="color:#50fa7b;">127.0.0.1</span> | TTL: 64 | Protocol: TCP(6)</td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05);"><strong>SEGMENT (L4)</strong></td><td style="border: 1px solid #444; padding: 8px;">Src Port: <span style="color:#f1fa8c;">54322</span> | Dest Port: <span style="color:#f1fa8c;">3000</span> | Seq: 1001 | Ack: 1 | Flags: <span style="color:#ff79c6;">[PSH, ACK]</span></td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,121,198,0.2);"><strong>PAYLOAD (L7)</strong></td><td style="border: 1px solid #444; padding: 8px;">POST /api/v1/devices + JSON Body (156b)</td></tr>
                </table>
            </div>
            
            <div style="margin-top:15px; background:#000; padding:10px; border-radius:5px; font-family:monospace; font-size:0.6rem; color:#666;">
                <div style="color:#ff79c6; margin-bottom:5px;">HEX DUMP (İlk 48 byte - POST Body):</div>
                <div style="line-height:1.4;">
                    0000: <span style="color:#8be9fd;">00 50 56 c0 00 08</span> <span style="color:#f1fa8c;">44 37 e6 32 a1 b2</span> <span style="color:#50fa7b;">08 00</span> 45 00<br>
                    0010: 00 9C 1c 47 40 00 40 06 00 00 c0 a8 01 0a 7f 00<br>
                    0020: 00 01 d4 32 0b b8 <span style="color:#ff79c6;">7B 22 68 6F 73 74 6E 61 6D 65</span>
                </div>
                <div style="margin-top:5px; font-size:0.55rem; color:#666;">
                    <span style="color:#ff79c6;">7B 22 68 6F 73 74</span> = <span style="color:#f1fa8c;">{"host</span> (JSON body başlangıcı)
                </div>
            </div>
            
            <div style="margin-top:10px; text-align:center; font-size:0.75rem; color:var(--success);">[ TCP CHECKSUM: VALID - CRC32: 0x5B4C3D2E ]</div>
        `,
        progress: 20
    },
    {
        title: "3. TLS Şifreleme (Confidentiality)",
        technical: `<strong>Veri Gizliliği:</strong><br><br>
            POST verileri hassas (credentials, device configs vb.) olabileceği için TLS 1.3 üzerinden şifrelenir.<br><br>
            <strong>Güvenlik:</strong><br>
            - Cipher: <code>TLS_AES_256_GCM_SHA384</code><br>
            - Integrity: HMAC-SHA384<br>
            - Perfect Forward Secrecy: Etkin`,
        component: `<strong>TLS Encryption Layer</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--success); margin-bottom:8px;">ŞİFRELEME DETAYLARI</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Algorithm:</td><td style="padding:3px; color:#50fa7b;">AES-256-GCM</td></tr>
                    <tr><td style="padding:3px;">Key Size:</td><td style="padding:3px; color:#8be9fd;">256-bit</td></tr>
                    <tr><td style="padding:3px;">IV Size:</td><td style="padding:3px; color:#f1fa8c;">96-bit</td></tr>
                    <tr><td style="padding:3px;">Auth Tag:</td><td style="padding:3px; color:#ff79c6;">128-bit</td></tr>
                </table>
            </div>`,
        content: `
            <div style="text-align: center; margin: 20px 0;">
                <div style="padding: 20px 40px; border: 3px solid var(--success); border-radius: 50px; background: rgba(16,185,129,0.1); display: inline-block;">
                    <span style="color: var(--success); font-weight: bold; letter-spacing: 3px; font-size:1.1rem;">ENCRYPTED TLS 1.3 TUNNEL</span>
                </div>
            </div>
            
            <div style="background:#000; padding:15px; border-radius:8px; border:1px solid #333;">
                <div style="color:var(--primary); font-size:0.75rem; margin-bottom:10px; font-weight:bold;">ŞİFRELENMİŞ VERİ (POST Body)</div>
                <div style="font-family:monospace; font-size:0.65rem; color:#666; word-break:break-all;">
                    <span style="color:var(--success);">17 03 03</span> 00 9A <span style="color:#f1fa8c;">4D 2B 8A F1 C3 E7 9B 12 56 7A B8 D4 E9 01 23 45 67 89 AB CD EF 01 23 45 67 89 AB CD EF 01...</span>
                </div>
                <div style="margin-top:8px; font-size:0.65rem; color:#666;">
                    <span style="color:var(--success);">Record Type</span> | <span style="color:#f1fa8c;">Encrypted Application Data</span>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:15px;">
                <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Encryption</div>
                    <div style="font-size:0.9rem; color:var(--success);">AES-GCM</div>
                </div>
                <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Overhead</div>
                    <div style="font-size:0.9rem; color:#8be9fd;">+21 bytes</div>
                </div>
                <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Encrypt Time</div>
                    <div style="font-size:0.9rem; color:#f1fa8c;">0.08ms</div>
                </div>
            </div>
        `,
        progress: 30
    },
    {
        title: "4. Handler Girişi (CreateDevice)",
        technical: `<strong>Go Handler:</strong><br><br>
            Sunucu, <code>CreateDevice</code> handler'ını tetikler. İlk işlem ham verinin bir havuza (Buffer) alınmasıdır.<br><br>
            <strong>İşlem Akışı:</strong><br>
            - Request Body okuma<br>
            - JSON decode (Unmarshal)<br>
            - Validation<br>
            - Database INSERT<br>
            - Response 201 Created`,
        component: `<strong>internal/api/handlers/devices.go</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--warning); margin-bottom:8px;">HANDLER METADATA</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Function:</td><td style="padding:3px; color:#50fa7b;">CreateDevice</td></tr>
                    <tr><td style="padding:3px;">Method:</td><td style="padding:3px; color:#ff79c6;">POST</td></tr>
                    <tr><td style="padding:3px;">Content-Type:</td><td style="padding:3px; color:#8be9fd;">application/json</td></tr>
                    <tr><td style="padding:3px;">Return:</td><td style="padding:3px; color:#f1fa8c;">201 Created</td></tr>
                </table>
            </div>`,
        content: `
            <div class="code-block">
                <span class="comment">// internal/api/handlers/devices.go</span><br>
                <span class="keyword">func</span> <span class="function">CreateDevice</span>(w http.ResponseWriter, r *http.Request) {<br>
                &nbsp;&nbsp;<span class="keyword">var</span> device models.Device<br><br>
                &nbsp;&nbsp;<span class="comment">// Request body'yi oku ve decode et</span><br>
                &nbsp;&nbsp;decoder := json.NewDecoder(r.Body)<br>
                &nbsp;&nbsp;decoder.DisallowUnknownFields() <span class="comment">// Güvenlik</span><br><br>
                &nbsp;&nbsp;<span class="keyword">if</span> err := decoder.Decode(&device); err != nil {<br>
                &nbsp;&nbsp;&nbsp;&nbsp;http.Error(w, err.Error(), http.StatusBadRequest)<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">return</span><br>
                &nbsp;&nbsp;}<br><br>
                &nbsp;&nbsp;<span class="comment">// UUID oluştur ve kaydet</span><br>
                &nbsp;&nbsp;device.ID = uuid.New().String()<br>
                &nbsp;&nbsp;...<br>
                }
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px;">
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Body Parse</div>
                    <div style="font-size:1rem; color:var(--success);">0.08ms</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">UUID Generation</div>
                    <div style="font-size:1rem; color:#8be9fd;">0.01ms</div>
                </div>
            </div>
        `,
        progress: 40
    },
    {
        title: "5. Router: POST Pattern Matching",
        technical: `<strong>Gorilla Mux Router:</strong><br><br>
            Router, isteği POST metoduyla eşleştirerek CreateDevice fonksiyonuna yönlendirir.<br><br>
            <strong>Route Tanımı:</strong><br>
            <code>r.HandleFunc("/api/v1/devices", CreateDevice).Methods("POST")</code>`,
        component: `<strong>mux.Router</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--primary); margin-bottom:8px;">ROUTE BİLGİLERİ</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Path:</td><td style="padding:3px; color:#50fa7b;">/api/v1/devices</td></tr>
                    <tr><td style="padding:3px;">Method:</td><td style="padding:3px; color:#ff79c6;">POST</td></tr>
                    <tr><td style="padding:3px;">Handler:</td><td style="padding:3px; color:#f1fa8c;">CreateDevice</td></tr>
                </table>
            </div>`,
        content: `
            <div style="background: #000; padding: 20px; border-radius: 10px; border: 1px solid #333;">
                <div style="font-size: 0.8rem; margin-bottom: 15px; border-bottom: 1px solid #222; padding-bottom: 8px; color: #ff79c6; font-weight:bold;">MUX ROUTING TABLE (POST)</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display:flex; justify-content:space-between; padding: 8px 12px; background: rgba(0,173,216,0.1); border-radius: 4px; color: var(--primary);">
                        <span>GET /api/v1/devices</span><span style="opacity:0.6;">[SKIP]</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding: 10px 12px; background: rgba(255,121,198,0.15); border: 2px solid #ff79c6; border-radius: 4px; color: #ff79c6; font-weight: bold;">
                        <span>POST /api/v1/devices</span><span>[EŞLEŞTİ]</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding: 8px 12px; background: rgba(245,158,11,0.1); border-radius: 4px; color: var(--warning);">
                        <span>PUT /api/v1/devices/{id}</span><span style="opacity:0.6;">[SKIP]</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-top:15px; padding:10px; background:rgba(255,121,198,0.1); border:1px solid #ff79c6; border-radius:5px; text-align:center; font-size:0.8rem;">
                <span style="color:#ff79c6;">Handler Matched:</span> <code style="color:#f1fa8c;">handlers.CreateDevice</code>
            </div>
        `,
        progress: 50
    },
    {
        title: "6. Middleware: Kimlik Doğrulama & RBAC",
        technical: `<strong>Yetkilendirme:</strong><br><br>
            Kimlik doğrulama başlığı (Authorization) üzerinden kullanıcının yazma (Write) yetkisi kontrol edilir.<br><br>
            <strong>RBAC Kontrolü:</strong><br>
            - User ID: yasin<br>
            - Role: admin<br>
            - Permission: devices:create<br>
            - Result: ALLOWED`,
        component: `<strong>Auth Middleware (JWT + RBAC)</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--warning); margin-bottom:8px;">JWT CLAIMS</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">sub:</td><td style="padding:3px; color:#50fa7b;">yasin</td></tr>
                    <tr><td style="padding:3px;">role:</td><td style="padding:3px; color:#ff79c6;">admin</td></tr>
                    <tr><td style="padding:3px;">exp:</td><td style="padding:3px; color:#f1fa8c;">2026-02-05T14:00:00Z</td></tr>
                    <tr><td style="padding:3px;">iat:</td><td style="padding:3px; color:#8be9fd;">2026-02-04T14:00:00Z</td></tr>
                </table>
            </div>`,
        content: `
            <div style="padding: 20px; text-align: center;">
                <div style="font-size:0.7rem; color:#666; margin-bottom:15px;">RBAC AUTHORIZATION FLOW</div>
                
                <div style="border: 2px solid var(--primary); padding: 15px; border-radius: 50px; margin-bottom: 8px; background: rgba(0,173,216,0.05);">
                    <span style="color:var(--primary); font-size:0.8rem;">1. JWT Token Verify</span>
                    <span style="float:right; font-size:0.65rem; color:var(--success);">VALID</span>
                </div>
                <div style="border: 2px solid var(--warning); padding: 15px; border-radius: 50px; margin-bottom: 8px; background: rgba(245,158,11,0.05);">
                    <span style="color:var(--warning); font-size:0.8rem;">2. Role: admin</span>
                    <span style="float:right; font-size:0.65rem; color:var(--success);">FOUND</span>
                </div>
                <div style="border: 2px solid var(--success); padding: 15px; border-radius: 50px; background: rgba(16,185,129,0.15);">
                    <span style="color:var(--success); font-size:0.9rem; font-weight:bold;">3. Permission: devices:create -> ALLOWED</span>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:15px;">
                <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Auth Time</div>
                    <div style="font-size:0.9rem; color:var(--success);">0.15ms</div>
                </div>
                <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">User ID</div>
                    <div style="font-size:0.9rem; color:#8be9fd;">yasin</div>
                </div>
                <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Access</div>
                    <div style="font-size:0.9rem; color:var(--success);">GRANTED</div>
                </div>
            </div>
        `,
        progress: 60
    },
    {
        title: "7. JSON Unmarshaling (String -> Struct)",
        technical: `<strong>Tersi-Serileştirme:</strong><br><br>
            Gelen JSON metni, projedeki <code>models.Device</code> yapısına dönüştürülür.<br><br>
            <strong>Güvenlik:</strong><br>
            - <code>DisallowUnknownFields()</code> aktif<br>
            - Strict type checking<br>
            - Field validation`,
        component: `<strong>Unmarshaling Layer (encoding/json)</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:#ff79c6; margin-bottom:8px;">DÖNÜŞÜM SÜRECİ</div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="padding:5px 10px; background:rgba(241,250,140,0.1); border:1px solid #f1fa8c; border-radius:4px;">JSON String</div>
                    <div style="color:#50fa7b;">-></div>
                    <div style="padding:5px 10px; background:rgba(0,173,216,0.1); border:1px solid var(--primary); border-radius:4px;">models.Device</div>
                </div>
            </div>`,
        content: `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.75rem; color:#f1fa8c; margin-bottom:10px; font-weight:bold;">JSON INPUT</div>
                    <pre style="font-size:0.65rem; margin:0; line-height:1.5;">{
  <span style="color:#ff79c6;">"hostname"</span>: <span style="color:#f1fa8c;">"IST-RTR-01"</span>,
  <span style="color:#ff79c6;">"ip"</span>: <span style="color:#f1fa8c;">"10.20.30.1"</span>,
  <span style="color:#ff79c6;">"vendor"</span>: <span style="color:#f1fa8c;">"Nokia"</span>,
  <span style="color:#ff79c6;">"model"</span>: <span style="color:#f1fa8c;">"SR-7750"</span>
}</pre>
                </div>
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.75rem; color:#50fa7b; margin-bottom:10px; font-weight:bold;">GO STRUCT</div>
                    <pre style="font-size:0.65rem; margin:0; line-height:1.5;">Device{
  Hostname: <span style="color:#f1fa8c;">"IST-RTR-01"</span>,
  IP: <span style="color:#f1fa8c;">"10.20.30.1"</span>,
  Vendor: <span style="color:#f1fa8c;">"Nokia"</span>,
  Model: <span style="color:#f1fa8c;">"SR-7750"</span>,
}</pre>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px;">
                <div style="background:rgba(80,250,123,0.1); padding:10px; border:1px solid #50fa7b; border-radius:5px; text-align:center;">
                    <div style="font-size:0.6rem; color:#666;">Unmarshal Time</div>
                    <div style="font-size:1rem; color:#50fa7b;">0.06ms</div>
                </div>
                <div style="background:rgba(0,173,216,0.1); padding:10px; border:1px solid var(--primary); border-radius:5px; text-align:center;">
                    <div style="font-size:0.6rem; color:#666;">Fields Mapped</div>
                    <div style="font-size:1rem; color:var(--primary);">4/4</div>
                </div>
            </div>
        `,
        progress: 70
    },
    {
        title: "8. Data Validation (İş Kuralları)",
        technical: `<strong>Doğrulama:</strong><br><br>
            Projedeki <code>device.Validate()</code> metodu çalışır.<br><br>
            <strong>Kontroller:</strong><br>
            - IP adresi formatı (regex)<br>
            - Hostname uzunluğu (max 64)<br>
            - Vendor whitelist<br>
            - Boş alan kontrolü`,
        component: `<strong>models.Device.Validate()</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--success); margin-bottom:8px;">VALIDATION KURALLARI</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">hostname:</td><td style="padding:3px; color:#50fa7b;">required, max:64</td></tr>
                    <tr><td style="padding:3px;">ip:</td><td style="padding:3px; color:#50fa7b;">required, ipv4</td></tr>
                    <tr><td style="padding:3px;">vendor:</td><td style="padding:3px; color:#50fa7b;">optional, oneof</td></tr>
                    <tr><td style="padding:3px;">model:</td><td style="padding:3px; color:#50fa7b;">optional, max:128</td></tr>
                </table>
            </div>`,
        content: `
            <div style="background:#000; padding:20px; border-radius:10px; border:2px solid var(--success);">
                <div style="display:flex; align-items:center; gap:15px; margin-bottom:15px;">
                    <div style="width:50px; height:50px; background:var(--success); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.5rem; color:#000;">✓</div>
                    <div>
                        <div style="font-size:1.1rem; color:var(--success); font-weight:bold;">VALIDATION PASSED</div>
                        <div style="font-size:0.75rem; color:#666;">Tüm iş kuralları sağlandı</div>
                    </div>
                </div>
                
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px;">
                    <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid var(--success);">
                        <div style="font-size:0.6rem; color:#666;">hostname</div>
                        <div style="font-size:0.75rem; color:var(--success);">OK</div>
                    </div>
                    <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid var(--success);">
                        <div style="font-size:0.6rem; color:#666;">ip</div>
                        <div style="font-size:0.75rem; color:var(--success);">OK</div>
                    </div>
                    <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid var(--success);">
                        <div style="font-size:0.6rem; color:#666;">vendor</div>
                        <div style="font-size:0.75rem; color:var(--success);">OK</div>
                    </div>
                    <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid var(--success);">
                        <div style="font-size:0.6rem; color:#666;">model</div>
                        <div style="font-size:0.75rem; color:var(--success);">OK</div>
                    </div>
                </div>
            </div>
        `,
        progress: 80
    },
    {
        title: "9. SQL: INSERT İşlemi",
        technical: `<strong>Veritabanı Yazma:</strong><br><br>
            Repository katmanı, veriyi PostgreSQL'e atomik bir işlem olarak gönderir.<br><br>
            <strong>İşlem Detayları:</strong><br>
            - UUID: Server-side generation<br>
            - Transaction: Auto-commit<br>
            - Returning: Yeni ID`,
        component: `<strong>PostgreSQL Transaction</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--primary); margin-bottom:8px;">INSERT PERFORMANSI</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Execution Time:</td><td style="padding:3px; color:#50fa7b; text-align:right;">0.82ms</td></tr>
                    <tr><td style="padding:3px;">Rows Affected:</td><td style="padding:3px; color:#8be9fd; text-align:right;">1</td></tr>
                    <tr><td style="padding:3px;">New UUID:</td><td style="padding:3px; color:#f1fa8c; text-align:right;">550e8400-e29b...</td></tr>
                </table>
            </div>`,
        content: `
            <div class="db-query" style="background:#000; padding:15px; border-radius:8px; border:1px solid var(--primary); font-family:monospace;">
                <div style="color:var(--primary); margin-bottom:10px; font-weight:bold;">SQL INSERT STATEMENT</div>
                <span style="color:#ff79c6;">INSERT INTO</span> devices<br>
                &nbsp;&nbsp;(id, hostname, ip, vendor, model, status, created_at)<br>
                <span style="color:#ff79c6;">VALUES</span><br>
                &nbsp;&nbsp;(<span style="color:#f1fa8c;">$1</span>, <span style="color:#f1fa8c;">$2</span>, <span style="color:#f1fa8c;">$3</span>, <span style="color:#f1fa8c;">$4</span>, <span style="color:#f1fa8c;">$5</span>, <span style="color:#f1fa8c;">$6</span>, <span style="color:#f1fa8c;">$7</span>)<br>
                <span style="color:#ff79c6;">RETURNING</span> id;
            </div>
            
            <div style="margin-top:15px; background:#111; padding:12px; border-radius:5px; border-left:3px solid var(--success);">
                <div style="font-size:0.7rem; color:#666;">EXECUTION RESULT</div>
                <div style="font-size:0.9rem; color:var(--success); margin-top:5px;">INSERT 0 1 | Time: 0.82ms</div>
                <div style="font-size:0.75rem; color:#f1fa8c; margin-top:5px;">New ID: 550e8400-e29b-41d4-a716-446655440000</div>
            </div>
        `,
        progress: 90
    },
    {
        title: "10. Yanıt: 201 Created",
        technical: `<strong>Başarılı Oluşturma:</strong><br><br>
            Kayıt başarılıdır. İstemciye 201 kodu ve yeni objenin detayları (Marshaling ile) geri gönderilir.<br><br>
            <strong>Response Headers:</strong><br>
            - Status: 201 Created<br>
            - Location: /api/v1/devices/{new_id}<br>
            - Content-Type: application/json`,
        component: `<strong>Final Result</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:#ff79c6; margin-bottom:8px;">YAŞAM DÖNGÜSÜ ÖZETİ</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Total Time:</td><td style="padding:3px; color:#50fa7b; text-align:right;">26.8ms</td></tr>
                    <tr><td style="padding:3px;">Network:</td><td style="padding:3px; color:#8be9fd; text-align:right;">20.1ms</td></tr>
                    <tr><td style="padding:3px;">Processing:</td><td style="padding:3px; color:#f1fa8c; text-align:right;">6.7ms</td></tr>
                </table>
            </div>`,
        content: `
            <div style="text-align: center; padding: 30px; background: rgba(255,121,198,0.05); border: 2px solid #ff79c6; border-radius: 15px;">
                <div style="font-size: 3rem; color: #ff79c6; font-weight: bold; margin-bottom: 15px;">201 Created</div>
                <div style="font-size: 1.2rem; color: rgba(255,255,255,0.8); margin-bottom: 20px;">YENİ KAYIT BAŞARIYLA OLUŞTURULDU</div>
                
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-top:20px;">
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Toplam Süre</div>
                        <div style="font-size:1rem; color:var(--primary);">26.8ms</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Body Size</div>
                        <div style="font-size:1rem; color:var(--warning);">320 bytes</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">New ID</div>
                        <div style="font-size:0.8rem; color:var(--success);">550e84...</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">DB Write</div>
                        <div style="font-size:1rem; color:#8be9fd;">0.82ms</div>
                    </div>
                </div>
                
                <div style="margin-top: 25px; font-size: 0.8rem; opacity: 0.6;">[ Yeni cihaz sisteme eklendi ]</div>
            </div>
        `,
        progress: 100
    }
];

// --- PUT, PATCH, DELETE için de aynı ULTRA-DETAY (her biri 10 sayfa) ---
// (Bu bloklar da V7 talebine uygun olarak en yüksek görsel zenginlikle doldurulmuştur)

const putStages = [
    {
        title: "1. PUT İsteği: Tam Güncelleme Analizi",
        technical: `<strong>RFC 7231 §4.3.4 - PUT</strong><br><br>
            PUT, kaynağın mevcut halini tamamen silip gönderilen yeni veriyle yer değiştirir.<br><br>
            <strong>Özellikler:</strong><br>
            - <strong>Idempotent:</strong> Aynı istek aynı sonucu verir<br>
            - <strong>Full Replace:</strong> Tüm alanlar güncellenir<br>
            - <strong>Body:</strong> Zorunlu (tam kaynak verisi)<br><br>
            <strong>Proje Endpoint:</strong><br>
            <code>router.HandleFunc("/api/v1/devices/{id}", handlers.UpdateDevice).Methods("PUT")</code>`,
        component: `<strong>PUT Request Headers & Body</strong><br><br>
            <div style="background:#000; padding:12px; border-radius:8px; border:1px solid #333; font-family:monospace; font-size:0.7rem; line-height:1.5;">
                <span style="color:#f5a623;">PUT</span> /api/v1/devices/550e8400-e29b... HTTP/1.1<br>
                <span style="color:#8be9fd;">Host:</span> localhost:3000<br>
                <span style="color:#8be9fd;">Content-Type:</span> application/json<br>
                <span style="color:#8be9fd;">Content-Length:</span> 198<br>
                <span style="color:#8be9fd;">Authorization:</span> Bearer eyJhbGciOiJIUzI1NiIs...<br>
                <span style="color:#8be9fd;">X-Request-ID:</span> put-550e8400-e29b-41d4...
            </div>`,
        content: `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 1.2rem; color: var(--warning); font-weight: bold; border: 2px solid var(--warning); padding: 15px 30px; border-radius: 8px; display: inline-block; background: rgba(245,158,11,0.05);">
                    İSTEMCİ -> [ HTTP PUT + FULL BODY ] -> SUNUCU
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.7rem; color:var(--warning); margin-bottom:10px; font-weight:bold;">REQUEST BODY FIELDS (FULL REPLACE)</div>
                    <table style="width:100%; font-size:0.75rem; border-collapse:collapse;">
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">hostname</td><td style="padding:5px; border-bottom:1px solid #333; color:#f1fa8c;">IST-RTR-01-UPDATED</td></tr>
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">ip</td><td style="padding:5px; border-bottom:1px solid #333; color:#f1fa8c;">10.20.30.100</td></tr>
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">vendor</td><td style="padding:5px; border-bottom:1px solid #333; color:#f1fa8c;">Cisco</td></tr>
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">model</td><td style="padding:5px; border-bottom:1px solid #333; color:#f1fa8c;">ASR-9001</td></tr>
                        <tr><td style="padding:5px;">status</td><td style="padding:5px; color:#f1fa8c;">maintenance</td></tr>
                    </table>
                </div>
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.7rem; color:var(--warning); margin-bottom:10px; font-weight:bold;">TIMING BREAKDOWN</div>
                    <div style="font-size:0.75rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>DNS Lookup:</span><span style="color:#50fa7b;">2.1ms</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>TCP Connect:</span><span style="color:#50fa7b;">4.3ms</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>TLS Handshake:</span><span style="color:#50fa7b;">12.8ms</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>Request Sent:</span><span style="color:#50fa7b;">1.4ms</span></div>
                    </div>
                </div>
            </div>
            
            <div style="background:#000; padding:15px; border-radius:8px; border:1px solid #333; font-family:monospace; font-size:0.75rem;">
                <div style="color:var(--warning); margin-bottom:10px; font-weight:bold;">REQUEST BODY (Full Replacement)</div>
                {<br>
                &nbsp;&nbsp;<span style="color:#50fa7b;">"hostname"</span>: <span style="color:#f1fa8c;">"IST-RTR-01-UPDATED"</span>,<br>
                &nbsp;&nbsp;<span style="color:#50fa7b;">"ip"</span>: <span style="color:#f1fa8c;">"10.20.30.100"</span>,<br>
                &nbsp;&nbsp;<span style="color:#50fa7b;">"vendor"</span>: <span style="color:#f1fa8c;">"Cisco"</span>,<br>
                &nbsp;&nbsp;<span style="color:#50fa7b;">"model"</span>: <span style="color:#f1fa8c;">"ASR-9001"</span>,<br>
                &nbsp;&nbsp;<span style="color:#50fa7b;">"status"</span>: <span style="color:#f1fa8c;">"maintenance"</span><br>
                }
            </div>
            
            <div style="margin-top:10px; padding:8px; background:rgba(245,158,11,0.1); border-radius:4px; font-size:0.7rem;">
                <strong>cURL Equivalent:</strong><br>
                <code style="color:#f1fa8c;">curl -X PUT "http://localhost:3000/api/v1/devices/550e8400..." -H "Content-Type: application/json" -d '{"hostname":"IST-RTR-01-UPDATED",...}'</code>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:10px; margin-top:15px;">
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Body Size</div>
                    <div style="font-size:1rem; color:var(--warning);">198 bytes</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Target ID</div>
                    <div style="font-size:0.8rem; color:#8be9fd;">550e84...</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Method</div>
                    <div style="font-size:1rem; color:var(--warning);">PUT</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Replace Type</div>
                    <div style="font-size:0.8rem; color:var(--danger);">FULL</div>
                </div>
            </div>
        `,
        progress: 10
    },
    {
        title: "2. Veri Paketleme ve L4-TCP Stream",
        technical: `<strong>TCP Segmentasyonu:</strong><br><br>
            PUT body'si TCP katmanında segmentlere bölünerek iletilir.<br><br>
            <strong>Akış Kontrolü:</strong><br>
            - Window Size: 65535 bytes<br>
            - Sequence Tracking: Enabled<br>
            - Error Recovery: Retransmit`,
        component: `<strong>TCP Stream Management</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--warning); margin-bottom:8px;">SEGMENT BİLGİLERİ</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Total Segments:</td><td style="padding:3px; color:#50fa7b; text-align:right;">1</td></tr>
                    <tr><td style="padding:3px;">Payload Size:</td><td style="padding:3px; color:#8be9fd; text-align:right;">198 bytes</td></tr>
                    <tr><td style="padding:3px;">Sequence Number:</td><td style="padding:3px; color:#f1fa8c; text-align:right;">2001</td></tr>
                </table>
            </div>`,
        content: `
            <div class="packet visible" style="border: 2px solid var(--warning); padding: 15px; border-radius: 10px; background: rgba(245,158,11,0.05);">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05); width:120px;"><strong>FRAME (L2)</strong></td><td style="border: 1px solid #444; padding: 8px;">Dest MAC: <span style="color:#8be9fd;">00:50:56:C0:00:08</span> | Src MAC: <span style="color:#8be9fd;">44:37:E6:32:A1:B2</span> | EtherType: 0x0800</td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05);"><strong>PACKET (L3)</strong></td><td style="border: 1px solid #444; padding: 8px;">Src IP: <span style="color:#50fa7b;">192.168.1.10</span> | Dest IP: <span style="color:#50fa7b;">127.0.0.1</span> | TTL: 64 | Protocol: TCP(6)</td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05);"><strong>SEGMENT (L4)</strong></td><td style="border: 1px solid #444; padding: 8px;">Src Port: <span style="color:#f1fa8c;">54323</span> | Dest Port: <span style="color:#f1fa8c;">3000</span> | Seq: 2001 | Ack: 1 | Flags: <span style="color:var(--warning);">[PSH, ACK]</span></td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(245,158,11,0.2);"><strong>PAYLOAD (L7)</strong></td><td style="border: 1px solid #444; padding: 8px;">PUT /api/v1/devices/{id} + JSON Body (198b)</td></tr>
                </table>
            </div>
            
            <div style="margin-top:15px; background:#000; padding:10px; border-radius:5px; font-family:monospace; font-size:0.6rem; color:#666;">
                <div style="color:var(--warning); margin-bottom:5px;">HEX DUMP (İlk 48 byte - PUT Body):</div>
                <div style="line-height:1.4;">
                    0000: <span style="color:#8be9fd;">00 50 56 c0 00 08</span> <span style="color:#f1fa8c;">44 37 e6 32 a1 b2</span> <span style="color:#50fa7b;">08 00</span> 45 00<br>
                    0010: 00 C6 1c 48 40 00 40 06 00 00 c0 a8 01 0a 7f 00<br>
                    0020: 00 01 d4 33 0b b8 <span style="color:var(--warning);">7B 22 68 6F 73 74 6E 61 6D 65</span>
                </div>
                <div style="margin-top:5px; font-size:0.55rem; color:#666;">
                    <span style="color:var(--warning);">7B 22 68 6F 73 74</span> = <span style="color:#f1fa8c;">{"host</span> (JSON body başlangıcı - FULL BODY)
                </div>
            </div>
            
            <div style="margin-top:10px; text-align:center; font-size:0.75rem; color:var(--success);">[ TCP CHECKSUM: VALID - CRC32: 0x6C5D4E3F ]</div>
        `,
        progress: 20
    },
    {
        title: "3. TLS Integrity (Veri Bütünlüğü)",
        technical: `<strong>Veri Bütünlüğü Doğrulaması:</strong><br><br>
            PUT işlemi hassas güncelleme içerdiğinden TLS MAC (Message Authentication Code) ile bütünlük doğrulanır.<br><br>
            <strong>Güvenlik:</strong><br>
            - MAC Algorithm: HMAC-SHA384<br>
            - Integrity Check: Passed<br>
            - Replay Protection: Enabled`,
        component: `<strong>TLS Integrity Layer</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--success); margin-bottom:8px;">BÜTÜNLÜK KONTROLÜ</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">MAC Status:</td><td style="padding:3px; color:#50fa7b;">VALID</td></tr>
                    <tr><td style="padding:3px;">Sequence:</td><td style="padding:3px; color:#8be9fd;">Verified</td></tr>
                    <tr><td style="padding:3px;">Replay:</td><td style="padding:3px; color:#f1fa8c;">Protected</td></tr>
                </table>
            </div>`,
        content: `
            <div style="text-align: center; margin: 20px 0;">
                <div style="padding: 20px 40px; border: 3px solid var(--success); border-radius: 50px; background: rgba(16,185,129,0.1); display: inline-block;">
                    <span style="color: var(--success); font-weight: bold; letter-spacing: 3px; font-size:1.1rem;">INTEGRITY CHECK PASSED</span>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:15px;">
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid var(--success);">
                    <div style="font-size:0.6rem; color:#666;">MAC</div>
                    <div style="font-size:1rem; color:var(--success);">VALID</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid var(--success);">
                    <div style="font-size:0.6rem; color:#666;">Decrypt</div>
                    <div style="font-size:1rem; color:var(--success);">OK</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid var(--success);">
                    <div style="font-size:0.6rem; color:#666;">Verify Time</div>
                    <div style="font-size:1rem; color:#8be9fd;">0.04ms</div>
                </div>
            </div>
        `,
        progress: 30
    },
    {
        title: "4. UpdateDevice Handler",
        technical: `<strong>Go Handler:</strong><br><br>
            <code>UpdateDevice</code> handler'ı tetiklenir. Mevcut kaydı bulup tüm alanları günceller.<br><br>
            <strong>İşlem Akışı:</strong><br>
            - URL'den ID çıkar<br>
            - Body parse et<br>
            - Mevcut kaydı kontrol et<br>
            - Full update yap`,
        component: `<strong>internal/api/handlers/devices.go</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--warning); margin-bottom:8px;">HANDLER METADATA</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Function:</td><td style="padding:3px; color:#50fa7b;">UpdateDevice</td></tr>
                    <tr><td style="padding:3px;">Method:</td><td style="padding:3px; color:var(--warning);">PUT</td></tr>
                    <tr><td style="padding:3px;">Path Param:</td><td style="padding:3px; color:#8be9fd;">{id}</td></tr>
                    <tr><td style="padding:3px;">Return:</td><td style="padding:3px; color:#f1fa8c;">200 OK</td></tr>
                </table>
            </div>`,
        content: `
            <div class="code-block">
                <span class="comment">// internal/api/handlers/devices.go</span><br>
                <span class="keyword">func</span> <span class="function">UpdateDevice</span>(w http.ResponseWriter, r *http.Request) {<br>
                &nbsp;&nbsp;<span class="comment">// URL'den ID parametresini al</span><br>
                &nbsp;&nbsp;vars := mux.Vars(r)<br>
                &nbsp;&nbsp;id := vars[<span class="string">"id"</span>]<br><br>
                &nbsp;&nbsp;<span class="keyword">var</span> device models.Device<br>
                &nbsp;&nbsp;<span class="keyword">if</span> err := json.NewDecoder(r.Body).Decode(&device); err != nil {<br>
                &nbsp;&nbsp;&nbsp;&nbsp;http.Error(w, err.Error(), http.StatusBadRequest)<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">return</span><br>
                &nbsp;&nbsp;}<br><br>
                &nbsp;&nbsp;<span class="comment">// Mevcut kaydı güncelle</span><br>
                &nbsp;&nbsp;device.ID = id<br>
                &nbsp;&nbsp;err := repo.Update(device)<br>
                &nbsp;&nbsp;...<br>
                }
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px;">
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">ID Extract</div>
                    <div style="font-size:1rem; color:var(--success);">0.01ms</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Body Parse</div>
                    <div style="font-size:1rem; color:#8be9fd;">0.08ms</div>
                </div>
            </div>
        `,
        progress: 40
    },
    {
        title: "5. Router: ID Extraction",
        technical: `<strong>Gorilla Mux Router:</strong><br><br>
            URL path'inden <code>{id}</code> parametresi çıkarılır ve handler'a iletilir.<br><br>
            <strong>Route Tanımı:</strong><br>
            <code>r.HandleFunc("/api/v1/devices/{id}", UpdateDevice).Methods("PUT")</code>`,
        component: `<strong>mux.Vars() - Path Parameters</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--primary); margin-bottom:8px;">EXTRACTED PARAMETERS</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Key:</td><td style="padding:3px; color:#50fa7b;">id</td></tr>
                    <tr><td style="padding:3px;">Value:</td><td style="padding:3px; color:#f1fa8c;">550e8400-e29b-41d4-a716...</td></tr>
                    <tr><td style="padding:3px;">Valid UUID:</td><td style="padding:3px; color:var(--success);">Yes</td></tr>
                </table>
            </div>`,
        content: `
            <div style="background: #000; padding: 20px; border-radius: 10px; border: 1px solid #333;">
                <div style="font-size: 0.8rem; margin-bottom: 15px; border-bottom: 1px solid #222; padding-bottom: 8px; color: var(--warning); font-weight:bold;">MUX ROUTING TABLE (PUT)</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display:flex; justify-content:space-between; padding: 8px 12px; background: rgba(0,173,216,0.1); border-radius: 4px; color: var(--primary);">
                        <span>GET /api/v1/devices/{id}</span><span style="opacity:0.6;">[SKIP]</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding: 10px 12px; background: rgba(245,158,11,0.15); border: 2px solid var(--warning); border-radius: 4px; color: var(--warning); font-weight: bold;">
                        <span>PUT /api/v1/devices/{id}</span><span>[EŞLEŞTİ]</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding: 8px 12px; background: rgba(239,68,68,0.1); border-radius: 4px; color: var(--danger);">
                        <span>DELETE /api/v1/devices/{id}</span><span style="opacity:0.6;">[SKIP]</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-top:15px; padding:10px; background:rgba(245,158,11,0.1); border:1px solid var(--warning); border-radius:5px; text-align:center; font-size:0.8rem;">
                <span style="color:var(--warning);">Target ID:</span> <code style="color:#f1fa8c;">550e8400-e29b-41d4-a716-446655440000</code>
            </div>
        `,
        progress: 50
    },
    {
        title: "6. Auth & RBAC (Yetki Kontrolü)",
        technical: `<strong>Yetkilendirme:</strong><br><br>
            Kullanıcının güncelleme (Update) yetkisi kontrol edilir.<br><br>
            <strong>RBAC Kontrolü:</strong><br>
            - User ID: yasin<br>
            - Role: admin<br>
            - Permission: devices:update<br>
            - Result: ALLOWED`,
        component: `<strong>Auth Middleware (JWT + RBAC)</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--warning); margin-bottom:8px;">YETKİ KONTROLÜ</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">User:</td><td style="padding:3px; color:#50fa7b;">yasin</td></tr>
                    <tr><td style="padding:3px;">Role:</td><td style="padding:3px; color:var(--warning);">admin</td></tr>
                    <tr><td style="padding:3px;">Permission:</td><td style="padding:3px; color:#f1fa8c;">devices:update</td></tr>
                    <tr><td style="padding:3px;">Result:</td><td style="padding:3px; color:var(--success);">ALLOWED</td></tr>
                </table>
            </div>`,
        content: `
            <div style="padding: 20px; text-align: center;">
                <div style="font-size:0.7rem; color:#666; margin-bottom:15px;">RBAC AUTHORIZATION FLOW</div>
                
                <div style="border: 2px solid var(--primary); padding: 15px; border-radius: 50px; margin-bottom: 8px; background: rgba(0,173,216,0.05);">
                    <span style="color:var(--primary); font-size:0.8rem;">1. JWT Token Verify</span>
                    <span style="float:right; font-size:0.65rem; color:var(--success);">VALID</span>
                </div>
                <div style="border: 2px solid var(--warning); padding: 15px; border-radius: 50px; margin-bottom: 8px; background: rgba(245,158,11,0.05);">
                    <span style="color:var(--warning); font-size:0.8rem;">2. Permission: devices:update</span>
                    <span style="float:right; font-size:0.65rem; color:var(--success);">FOUND</span>
                </div>
                <div style="border: 2px solid var(--success); padding: 15px; border-radius: 50px; background: rgba(16,185,129,0.15);">
                    <span style="color:var(--success); font-size:0.9rem; font-weight:bold;">3. Access -> GRANTED</span>
                </div>
            </div>
        `,
        progress: 60
    },
    {
        title: "7. Unmarshaling & Validation",
        technical: `<strong>Veri Doğrulama:</strong><br><br>
            Gelen tam JSON verisi parse edilir ve iş kuralları doğrulanır.<br><br>
            <strong>Kontroller:</strong><br>
            - Tüm zorunlu alanlar mevcut mu?<br>
            - Format doğrulaması<br>
            - Existing record check`,
        component: `<strong>Validation Layer</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--success); margin-bottom:8px;">VALIDATION SONUCU</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">hostname:</td><td style="padding:3px; color:#50fa7b;">required ✓</td></tr>
                    <tr><td style="padding:3px;">ip:</td><td style="padding:3px; color:#50fa7b;">valid IPv4 ✓</td></tr>
                    <tr><td style="padding:3px;">vendor:</td><td style="padding:3px; color:#50fa7b;">whitelist ✓</td></tr>
                    <tr><td style="padding:3px;">exists:</td><td style="padding:3px; color:#50fa7b;">found ✓</td></tr>
                </table>
            </div>`,
        content: `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.75rem; color:#f1fa8c; margin-bottom:10px; font-weight:bold;">INPUT VALIDATION</div>
                    <div style="display:flex; flex-direction:column; gap:5px; font-size:0.7rem;">
                        <div style="display:flex; justify-content:space-between;"><span>hostname</span><span style="color:var(--success);">✓</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>ip</span><span style="color:var(--success);">✓</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>vendor</span><span style="color:var(--success);">✓</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>model</span><span style="color:var(--success);">✓</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>status</span><span style="color:var(--success);">✓</span></div>
                    </div>
                </div>
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.75rem; color:#50fa7b; margin-bottom:10px; font-weight:bold;">RECORD CHECK</div>
                    <div style="font-size:0.7rem; margin-bottom:8px;">Target ID Exists: <span style="color:var(--success);">YES</span></div>
                    <div style="font-size:0.7rem;">Current Hostname: <span style="color:#8be9fd;">IST-RTR-01</span></div>
                    <div style="font-size:0.7rem;">New Hostname: <span style="color:#f1fa8c;">IST-RTR-01-UPDATED</span></div>
                </div>
            </div>
            
            <div style="margin-top:15px; padding:10px; background:rgba(80,250,123,0.1); border:1px solid #50fa7b; border-radius:5px; text-align:center; font-size:0.8rem;">
                <span style="color:#50fa7b;">Validation Time:</span> <span style="color:#f1fa8c;">0.05ms</span>
            </div>
        `,
        progress: 70
    },
    {
        title: "8. SQL: Full UPDATE İşlemi",
        technical: `<strong>Tam Güncelleme:</strong><br><br>
            Tüm alanlar güncellenir. PUT semantiğine uygun olarak eksik alanlar NULL yapılır.<br><br>
            <strong>İşlem Detayları:</strong><br>
            - Full row replacement<br>
            - updated_at timestamp<br>
            - Row lock during update`,
        component: `<strong>PostgreSQL UPDATE</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--warning); margin-bottom:8px;">UPDATE PERFORMANSI</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Execution Time:</td><td style="padding:3px; color:#50fa7b; text-align:right;">1.24ms</td></tr>
                    <tr><td style="padding:3px;">Rows Affected:</td><td style="padding:3px; color:#8be9fd; text-align:right;">1</td></tr>
                    <tr><td style="padding:3px;">Columns Updated:</td><td style="padding:3px; color:#f1fa8c; text-align:right;">5</td></tr>
                </table>
            </div>`,
        content: `
            <div class="db-query" style="background:#000; padding:15px; border-radius:8px; border:1px solid var(--warning); font-family:monospace;">
                <div style="color:var(--warning); margin-bottom:10px; font-weight:bold;">SQL UPDATE STATEMENT</div>
                <span style="color:#ff79c6;">UPDATE</span> devices<br>
                <span style="color:#ff79c6;">SET</span><br>
                &nbsp;&nbsp;hostname = <span style="color:#f1fa8c;">$1</span>,<br>
                &nbsp;&nbsp;ip = <span style="color:#f1fa8c;">$2</span>,<br>
                &nbsp;&nbsp;vendor = <span style="color:#f1fa8c;">$3</span>,<br>
                &nbsp;&nbsp;model = <span style="color:#f1fa8c;">$4</span>,<br>
                &nbsp;&nbsp;status = <span style="color:#f1fa8c;">$5</span>,<br>
                &nbsp;&nbsp;updated_at = <span style="color:#8be9fd;">NOW()</span><br>
                <span style="color:#ff79c6;">WHERE</span> id = <span style="color:#f1fa8c;">$6</span>;
            </div>
            
            <div style="margin-top:15px; background:#111; padding:12px; border-radius:5px; border-left:3px solid var(--success);">
                <div style="font-size:0.7rem; color:#666;">EXECUTION RESULT</div>
                <div style="font-size:0.9rem; color:var(--success); margin-top:5px;">UPDATE 1 | Time: 1.24ms</div>
            </div>
        `,
        progress: 85
    },
    {
        title: "9. Row Check (Etkilenen Satır Kontrolü)",
        technical: `<strong>Sonuç Doğrulama:</strong><br><br>
            Güncelleme işleminden etkilenen satır sayısı kontrol edilir.<br><br>
            <strong>Durumlar:</strong><br>
            - rowsAffected == 0: 404 Not Found<br>
            - rowsAffected == 1: 200 OK<br>
            - error != nil: 500 Internal Error`,
        component: `<strong>Result Handler</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--success); margin-bottom:8px;">SONUÇ KONTROLÜ</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Rows Affected:</td><td style="padding:3px; color:#50fa7b;">1</td></tr>
                    <tr><td style="padding:3px;">Error:</td><td style="padding:3px; color:#50fa7b;">nil</td></tr>
                    <tr><td style="padding:3px;">Status:</td><td style="padding:3px; color:var(--success);">SUCCESS</td></tr>
                </table>
            </div>`,
        content: `
            <div class="code-block">
                <span class="comment">// Row check logic</span><br>
                result, err := repo.Update(device)<br><br>
                <span class="keyword">if</span> err != nil {<br>
                &nbsp;&nbsp;http.Error(w, <span class="string">"Internal Error"</span>, 500)<br>
                &nbsp;&nbsp;<span class="keyword">return</span><br>
                }<br><br>
                rowsAffected, _ := result.RowsAffected()<br>
                <span class="keyword">if</span> rowsAffected == 0 {<br>
                &nbsp;&nbsp;http.Error(w, <span class="string">"Device not found"</span>, 404)<br>
                &nbsp;&nbsp;<span class="keyword">return</span><br>
                }<br><br>
                <span class="comment">// Success - proceed to 200 OK</span>
            </div>
            
            <div style="margin-top:15px; padding:15px; background:rgba(16,185,129,0.1); border:2px solid var(--success); border-radius:8px; text-align:center;">
                <div style="font-size:1.2rem; color:var(--success); font-weight:bold;">rowsAffected = 1</div>
                <div style="font-size:0.8rem; color:#666; margin-top:5px;">Güncelleme başarılı, yanıt hazırlanıyor</div>
            </div>
        `,
        progress: 95
    },
    {
        title: "10. Yanıt: 200 OK (Güncellendi)",
        technical: `<strong>Başarılı Güncelleme:</strong><br><br>
            Kayıt başarıyla güncellendi. İstemciye 200 OK ve güncel veri döndürülür.<br><br>
            <strong>Response Headers:</strong><br>
            - Status: 200 OK<br>
            - Content-Type: application/json<br>
            - X-Updated-At: timestamp`,
        component: `<strong>Final Result</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--warning); margin-bottom:8px;">YAŞAM DÖNGÜSÜ ÖZETİ</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Total Time:</td><td style="padding:3px; color:#50fa7b; text-align:right;">28.2ms</td></tr>
                    <tr><td style="padding:3px;">Network:</td><td style="padding:3px; color:#8be9fd; text-align:right;">21.3ms</td></tr>
                    <tr><td style="padding:3px;">Processing:</td><td style="padding:3px; color:#f1fa8c; text-align:right;">6.9ms</td></tr>
                </table>
            </div>`,
        content: `
            <div style="text-align: center; padding: 30px; background: rgba(245,158,11,0.05); border: 2px solid var(--warning); border-radius: 15px;">
                <div style="font-size: 3rem; color: var(--warning); font-weight: bold; margin-bottom: 15px;">200 OK</div>
                <div style="font-size: 1.2rem; color: rgba(255,255,255,0.8); margin-bottom: 20px;">KAYIT BAŞARIYLA GÜNCELLENDİ</div>
                
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-top:20px;">
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Toplam Süre</div>
                        <div style="font-size:1rem; color:var(--primary);">28.2ms</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Fields Updated</div>
                        <div style="font-size:1rem; color:var(--warning);">5</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">DB Time</div>
                        <div style="font-size:1rem; color:var(--success);">1.24ms</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Response Size</div>
                        <div style="font-size:1rem; color:#8be9fd;">340b</div>
                    </div>
                </div>
                
                <div style="margin-top: 25px; font-size: 0.8rem; opacity: 0.6;">[ Cihaz bilgileri güncellendi ]</div>
            </div>
        `,
        progress: 100
    }
];

const patchStages = [
    {
        title: "1. PATCH İsteği: Kısmi Güncelleme",
        technical: `<strong>RFC 5789 - PATCH</strong><br><br>
            PATCH, sadece belirtilen alanları günceller. Daha az veri transferi sağlar.<br><br>
            <strong>Özellikler:</strong><br>
            - <strong>Partial Update:</strong> Sadece gönderilen alanlar değişir<br>
            - <strong>Idempotent:</strong> Hayır (genellikle)<br>
            - <strong>Bandwidth Efficient:</strong> Minimal veri transferi<br><br>
            <strong>Proje Endpoint:</strong><br>
            <code>router.HandleFunc("/api/v1/devices/{id}", handlers.PatchDevice).Methods("PATCH")</code>`,
        component: `<strong>PATCH Request Headers & Body</strong><br><br>
            <div style="background:#000; padding:12px; border-radius:8px; border:1px solid #333; font-family:monospace; font-size:0.7rem; line-height:1.5;">
                <span style="color:#bd93f9;">PATCH</span> /api/v1/devices/550e8400-e29b... HTTP/1.1<br>
                <span style="color:#8be9fd;">Host:</span> localhost:3000<br>
                <span style="color:#8be9fd;">Content-Type:</span> application/json<br>
                <span style="color:#8be9fd;">Content-Length:</span> 28<br>
                <span style="color:#8be9fd;">Authorization:</span> Bearer eyJhbGciOiJIUzI1NiIs...
            </div>`,
        content: `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 1.2rem; color: #bd93f9; font-weight: bold; border: 2px solid #bd93f9; padding: 15px 30px; border-radius: 8px; display: inline-block; background: rgba(189,147,249,0.05);">
                    İSTEMCİ -> [ HTTP PATCH + SPARSE BODY ] -> SUNUCU
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.7rem; color:#bd93f9; margin-bottom:10px; font-weight:bold;">PATCH vs PUT COMPARISON</div>
                    <table style="width:100%; font-size:0.75rem; border-collapse:collapse;">
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">PATCH Body</td><td style="padding:5px; border-bottom:1px solid #333; color:var(--success);">28 bytes</td></tr>
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">PUT Body</td><td style="padding:5px; border-bottom:1px solid #333; color:var(--warning);">198 bytes</td></tr>
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">Savings</td><td style="padding:5px; border-bottom:1px solid #333; color:var(--success);">-86%</td></tr>
                        <tr><td style="padding:5px;">Fields Changed</td><td style="padding:5px; color:#bd93f9;">1 (status only)</td></tr>
                    </table>
                </div>
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.7rem; color:var(--warning); margin-bottom:10px; font-weight:bold;">TIMING BREAKDOWN</div>
                    <div style="font-size:0.75rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>DNS Lookup:</span><span style="color:#50fa7b;">2.1ms</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>TCP Connect:</span><span style="color:#50fa7b;">4.3ms</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>TLS Handshake:</span><span style="color:#50fa7b;">12.8ms</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>Request Sent:</span><span style="color:#50fa7b;">0.3ms</span></div>
                    </div>
                </div>
            </div>
            
            <div style="background:#000; padding:15px; border-radius:8px; border:1px solid #333; font-family:monospace; font-size:0.75rem;">
                <div style="color:#bd93f9; margin-bottom:10px; font-weight:bold;">REQUEST BODY (Partial - Sadece Değişen Alan)</div>
                {<br>
                &nbsp;&nbsp;<span style="color:#50fa7b;">"status"</span>: <span style="color:#f1fa8c;">"maintenance"</span><br>
                }
            </div>
            
            <div style="margin-top:10px; padding:8px; background:rgba(189,147,249,0.1); border-radius:4px; font-size:0.7rem;">
                <strong>cURL Equivalent:</strong><br>
                <code style="color:#f1fa8c;">curl -X PATCH "http://localhost:3000/api/v1/devices/550e8400..." -H "Content-Type: application/json" -d '{"status":"maintenance"}'</code>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:10px; margin-top:15px;">
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Body Size</div>
                    <div style="font-size:1rem; color:#bd93f9;">28 bytes</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Fields Changed</div>
                    <div style="font-size:1rem; color:var(--success);">1</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Method</div>
                    <div style="font-size:1rem; color:#bd93f9;">PATCH</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Update Type</div>
                    <div style="font-size:0.8rem; color:var(--success);">PARTIAL</div>
                </div>
            </div>
        `,
        progress: 10
    },
    {
        title: "2. Sparse Data Processing",
        technical: `<strong>Küçük Boyutlu Paket:</strong><br><br>
            PATCH minimal veri gönderir - sadece değişen alanlar.<br><br>
            <strong>Avantajlar:</strong><br>
            - Bandwidth tasarrufu<br>
            - Hızlı transfer<br>
            - Düşük latency`,
        component: `<strong>Network Stack (Sparse)</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:#bd93f9; margin-bottom:8px;">SEGMENT BİLGİLERİ</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Total Segments:</td><td style="padding:3px; color:#50fa7b; text-align:right;">1</td></tr>
                    <tr><td style="padding:3px;">Payload Size:</td><td style="padding:3px; color:#8be9fd; text-align:right;">28 bytes</td></tr>
                    <tr><td style="padding:3px;">vs PUT Size:</td><td style="padding:3px; color:var(--success); text-align:right;">-86%</td></tr>
                </table>
            </div>`,
        content: `
            <div class="packet visible" style="border: 2px solid #bd93f9; padding: 15px; border-radius: 10px; background: rgba(189,147,249,0.05);">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05); width:120px;"><strong>FRAME (L2)</strong></td><td style="border: 1px solid #444; padding: 8px;">Dest MAC: <span style="color:#8be9fd;">00:50:56:C0:00:08</span> | Src MAC: <span style="color:#8be9fd;">44:37:E6:32:A1:B2</span> | EtherType: 0x0800</td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05);"><strong>PACKET (L3)</strong></td><td style="border: 1px solid #444; padding: 8px;">Src IP: <span style="color:#50fa7b;">192.168.1.10</span> | Dest IP: <span style="color:#50fa7b;">127.0.0.1</span> | TTL: 64 | Protocol: TCP(6)</td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05);"><strong>SEGMENT (L4)</strong></td><td style="border: 1px solid #444; padding: 8px;">Src Port: <span style="color:#f1fa8c;">54324</span> | Dest Port: <span style="color:#f1fa8c;">3000</span> | Seq: 3001 | Ack: 1 | Flags: <span style="color:#bd93f9;">[PSH, ACK]</span></td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(189,147,249,0.2);"><strong>PAYLOAD (L7)</strong></td><td style="border: 1px solid #444; padding: 8px;">PATCH /api/v1/devices/{id} + Sparse Body (28b)</td></tr>
                </table>
            </div>
            
            <div style="margin-top:15px; background:#000; padding:10px; border-radius:5px; font-family:monospace; font-size:0.6rem; color:#666;">
                <div style="color:#bd93f9; margin-bottom:5px;">HEX DUMP (PATCH Body - SPARSE):</div>
                <div style="line-height:1.4;">
                    0000: <span style="color:#8be9fd;">00 50 56 c0 00 08</span> <span style="color:#f1fa8c;">44 37 e6 32 a1 b2</span> <span style="color:#50fa7b;">08 00</span> 45 00<br>
                    0010: 00 1C 1c 49 40 00 40 06 00 00 c0 a8 01 0a 7f 00<br>
                    0020: 00 01 d4 34 0b b8 <span style="color:#bd93f9;">7B 22 73 74 61 74 75 73</span>
                </div>
                <div style="margin-top:5px; font-size:0.55rem; color:#666;">
                    <span style="color:#bd93f9;">7B 22 73 74 61 74</span> = <span style="color:#f1fa8c;">{"stat</span> (SPARSE - sadece 28 bytes)
                </div>
            </div>
            
            <div style="margin-top:15px; padding:10px; background:rgba(16,185,129,0.1); border:1px solid var(--success); border-radius:5px; text-align:center; font-size:0.8rem;">
                <span style="color:var(--success);">Bandwidth Savings:</span> <span style="color:#f1fa8c;">170 bytes saved vs PUT (-86%)</span>
            </div>
            
            <div style="margin-top:10px; text-align:center; font-size:0.75rem; color:var(--success);">[ TCP CHECKSUM: VALID - CRC32: 0x7D6E5F40 ]</div>
        `,
        progress: 20
    },
    {
        title: "3. TLS Encryption",
        technical: `<strong>Güvenli Kanal:</strong><br><br>
            PATCH verisi de TLS 1.3 ile şifrelenir.<br><br>
            <strong>Güvenlik:</strong><br>
            - Same encryption as PUT/POST<br>
            - Forward Secrecy: Enabled<br>
            - Cipher: AES-256-GCM`,
        component: `<strong>TLS Layer</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--success); margin-bottom:8px;">ŞİFRELEME DURUMU</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Channel:</td><td style="padding:3px; color:#50fa7b;">Secure</td></tr>
                    <tr><td style="padding:3px;">Encryption:</td><td style="padding:3px; color:#8be9fd;">AES-256-GCM</td></tr>
                    <tr><td style="padding:3px;">Overhead:</td><td style="padding:3px; color:#f1fa8c;">+21 bytes</td></tr>
                </table>
            </div>`,
        content: `
            <div style="text-align: center; margin: 20px 0;">
                <div style="padding: 20px 40px; border: 3px solid var(--success); border-radius: 50px; background: rgba(16,185,129,0.1); display: inline-block;">
                    <span style="color: var(--success); font-weight: bold; letter-spacing: 3px; font-size:1.1rem;">SECURE CHANNEL ACTIVE</span>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:15px;">
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid var(--success);">
                    <div style="font-size:0.6rem; color:#666;">Encrypted</div>
                    <div style="font-size:1rem; color:var(--success);">YES</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid var(--success);">
                    <div style="font-size:0.6rem; color:#666;">MAC</div>
                    <div style="font-size:1rem; color:var(--success);">VALID</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid var(--success);">
                    <div style="font-size:0.6rem; color:#666;">Decrypt</div>
                    <div style="font-size:1rem; color:#8be9fd;">0.03ms</div>
                </div>
            </div>
        `,
        progress: 30
    },
    {
        title: "4. PatchDevice Handler",
        technical: `<strong>Go Handler:</strong><br><br>
            <code>PatchDevice</code> handler'ı tetiklenir. Dinamik map kullanarak sadece gönderilen alanları günceller.<br><br>
            <strong>İşlem Akışı:</strong><br>
            - URL'den ID çıkar<br>
            - map[string]interface{} decode<br>
            - Dynamic field update<br>
            - Merge with existing`,
        component: `<strong>internal/api/handlers/devices.go</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:#bd93f9; margin-bottom:8px;">HANDLER METADATA</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Function:</td><td style="padding:3px; color:#50fa7b;">PatchDevice</td></tr>
                    <tr><td style="padding:3px;">Method:</td><td style="padding:3px; color:#bd93f9;">PATCH</td></tr>
                    <tr><td style="padding:3px;">Data Type:</td><td style="padding:3px; color:#8be9fd;">map[string]interface{}</td></tr>
                    <tr><td style="padding:3px;">Return:</td><td style="padding:3px; color:#f1fa8c;">200 OK</td></tr>
                </table>
            </div>`,
        content: `
            <div class="code-block">
                <span class="comment">// internal/api/handlers/devices.go</span><br>
                <span class="keyword">func</span> <span class="function">PatchDevice</span>(w http.ResponseWriter, r *http.Request) {<br>
                &nbsp;&nbsp;vars := mux.Vars(r)<br>
                &nbsp;&nbsp;id := vars[<span class="string">"id"</span>]<br><br>
                &nbsp;&nbsp;<span class="comment">// Dinamik map kullan - sadece gönderilen alanları al</span><br>
                &nbsp;&nbsp;<span class="keyword">var</span> updates map[string]interface{}<br>
                &nbsp;&nbsp;<span class="keyword">if</span> err := json.NewDecoder(r.Body).Decode(&updates); err != nil {<br>
                &nbsp;&nbsp;&nbsp;&nbsp;http.Error(w, err.Error(), http.StatusBadRequest)<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">return</span><br>
                &nbsp;&nbsp;}<br><br>
                &nbsp;&nbsp;<span class="comment">// Dinamik SQL oluştur ve çalıştır</span><br>
                &nbsp;&nbsp;err := repo.PartialUpdate(id, updates)<br>
                &nbsp;&nbsp;...<br>
                }
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px;">
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Map Decode</div>
                    <div style="font-size:1rem; color:var(--success);">0.02ms</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Fields Received</div>
                    <div style="font-size:1rem; color:#bd93f9;">1</div>
                </div>
            </div>
        `,
        progress: 40
    },
    {
        title: "5. Router Match",
        technical: `<strong>Gorilla Mux Router:</strong><br><br>
            PATCH metoduyla eşleşen route bulunur ve handler'a yönlendirilir.<br><br>
            <strong>Route Tanımı:</strong><br>
            <code>r.HandleFunc("/api/v1/devices/{id}", PatchDevice).Methods("PATCH")</code>`,
        component: `<strong>mux.Router - PATCH Match</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--primary); margin-bottom:8px;">ROUTE DETAYLARI</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Path:</td><td style="padding:3px; color:#50fa7b;">/api/v1/devices/{id}</td></tr>
                    <tr><td style="padding:3px;">Method:</td><td style="padding:3px; color:#bd93f9;">PATCH</td></tr>
                    <tr><td style="padding:3px;">Handler:</td><td style="padding:3px; color:#f1fa8c;">PatchDevice</td></tr>
                </table>
            </div>`,
        content: `
            <div style="background: #000; padding: 20px; border-radius: 10px; border: 1px solid #333;">
                <div style="font-size: 0.8rem; margin-bottom: 15px; border-bottom: 1px solid #222; padding-bottom: 8px; color: #bd93f9; font-weight:bold;">MUX ROUTING TABLE (PATCH)</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display:flex; justify-content:space-between; padding: 8px 12px; background: rgba(245,158,11,0.1); border-radius: 4px; color: var(--warning);">
                        <span>PUT /api/v1/devices/{id}</span><span style="opacity:0.6;">[SKIP]</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding: 10px 12px; background: rgba(189,147,249,0.15); border: 2px solid #bd93f9; border-radius: 4px; color: #bd93f9; font-weight: bold;">
                        <span>PATCH /api/v1/devices/{id}</span><span>[EŞLEŞTİ]</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding: 8px 12px; background: rgba(239,68,68,0.1); border-radius: 4px; color: var(--danger);">
                        <span>DELETE /api/v1/devices/{id}</span><span style="opacity:0.6;">[SKIP]</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-top:15px; padding:10px; background:rgba(189,147,249,0.1); border:1px solid #bd93f9; border-radius:5px; text-align:center; font-size:0.8rem;">
                <span style="color:#bd93f9;">Target ID:</span> <code style="color:#f1fa8c;">550e8400-e29b-41d4-a716-446655440000</code>
            </div>
        `,
        progress: 50
    },
    {
        title: "6. Middleware Stack",
        technical: `<strong>Middleware Zinciri:</strong><br><br>
            Logger ve Auth middleware'leri çalışır. PATCH işlemi loglanır.<br><br>
            <strong>Loglar:</strong><br>
            - Request ID ataması<br>
            - PATCH operation log<br>
            - User context`,
        component: `<strong>Middleware Pipeline</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--warning); margin-bottom:8px;">LOG KAYITLARI</div>
                <div style="font-family:monospace; font-size:0.6rem; color:#666;">
                    [INFO] req_id=patch-550e8400<br>
                    [INFO] method=PATCH path=/api/v1/devices/{id}<br>
                    [INFO] user=yasin action=partial_update
                </div>
            </div>`,
        content: `
            <div style="padding: 20px; text-align: center;">
                <div style="font-size:0.7rem; color:#666; margin-bottom:15px;">MIDDLEWARE PIPELINE</div>
                
                <div style="border: 2px solid var(--primary); padding: 15px; border-radius: 50px; margin-bottom: 8px; background: rgba(0,173,216,0.05);">
                    <span style="color:var(--primary); font-size:0.8rem;">1. RequestID Middleware</span>
                    <span style="float:right; font-size:0.65rem; color:#666;">0.01ms</span>
                </div>
                <div style="border: 2px solid #8be9fd; padding: 15px; border-radius: 50px; margin-bottom: 8px; background: rgba(139,233,253,0.05);">
                    <span style="color:#8be9fd; font-size:0.8rem;">2. Logger: PATCH uuid-123</span>
                    <span style="float:right; font-size:0.65rem; color:#666;">0.02ms</span>
                </div>
                <div style="border: 2px solid var(--success); padding: 15px; border-radius: 50px; background: rgba(16,185,129,0.15);">
                    <span style="color:var(--success); font-size:0.9rem; font-weight:bold;">3. Auth: devices:patch -> ALLOWED</span>
                </div>
            </div>
        `,
        progress: 60
    },
    {
        title: "7. Map Decoding (Dinamik Parse)",
        technical: `<strong>Dinamik JSON Parse:</strong><br><br>
            Struct yerine map[string]interface{} kullanılır. Sadece gönderilen alanlar alınır.<br><br>
            <strong>Avantajlar:</strong><br>
            - Flexible schema<br>
            - Unknown fields allowed<br>
            - Partial data handling`,
        component: `<strong>JSON/Logic - Map Decode</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:#bd93f9; margin-bottom:8px;">DECODE SONUCU</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Type:</td><td style="padding:3px; color:#8be9fd;">map[string]interface{}</td></tr>
                    <tr><td style="padding:3px;">Keys:</td><td style="padding:3px; color:#50fa7b;">["status"]</td></tr>
                    <tr><td style="padding:3px;">Values:</td><td style="padding:3px; color:#f1fa8c;">["maintenance"]</td></tr>
                </table>
            </div>`,
        content: `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.75rem; color:#f1fa8c; margin-bottom:10px; font-weight:bold;">JSON INPUT (Sparse)</div>
                    <pre style="font-size:0.7rem; margin:0; line-height:1.5;">{
  <span style="color:#ff79c6;">"status"</span>: <span style="color:#f1fa8c;">"maintenance"</span>
}</pre>
                </div>
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.75rem; color:#50fa7b; margin-bottom:10px; font-weight:bold;">GO MAP</div>
                    <pre style="font-size:0.7rem; margin:0; line-height:1.5;">map[string]interface{}{
  <span style="color:#f1fa8c;">"status"</span>: <span style="color:#f1fa8c;">"maintenance"</span>,
}</pre>
                </div>
            </div>
            
            <div class="code-block" style="margin-top:15px; font-size:0.7rem;">
                <span class="comment">// Map decoding</span><br>
                <span class="keyword">var</span> updates map[string]interface{}<br>
                json.NewDecoder(r.Body).Decode(&updates)<br>
                <span class="comment">// updates["status"] = "maintenance"</span>
            </div>
        `,
        progress: 70
    },
    {
        title: "8. Dynamic SQL Build",
        technical: `<strong>Dinamik SQL İnşası:</strong><br><br>
            Gönderilen alanlara göre dinamik UPDATE SQL'i oluşturulur.<br><br>
            <strong>İşlem:</strong><br>
            - Iterate over map keys<br>
            - Build SET clause dynamically<br>
            - Parameterized query`,
        component: `<strong>PostgreSQL Dynamic Query</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:#bd93f9; margin-bottom:8px;">QUERY PERFORMANSI</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Execution Time:</td><td style="padding:3px; color:#50fa7b; text-align:right;">0.68ms</td></tr>
                    <tr><td style="padding:3px;">Rows Affected:</td><td style="padding:3px; color:#8be9fd; text-align:right;">1</td></tr>
                    <tr><td style="padding:3px;">Columns Updated:</td><td style="padding:3px; color:#f1fa8c; text-align:right;">1</td></tr>
                </table>
            </div>`,
        content: `
            <div class="db-query" style="background:#000; padding:15px; border-radius:8px; border:1px solid #bd93f9; font-family:monospace;">
                <div style="color:#bd93f9; margin-bottom:10px; font-weight:bold;">DYNAMIC SQL (Sadece status Güncelleniyor)</div>
                <span style="color:#ff79c6;">UPDATE</span> devices<br>
                <span style="color:#ff79c6;">SET</span><br>
                &nbsp;&nbsp;status = <span style="color:#f1fa8c;">$1</span>,<br>
                &nbsp;&nbsp;updated_at = <span style="color:#8be9fd;">NOW()</span><br>
                <span style="color:#ff79c6;">WHERE</span> id = <span style="color:#f1fa8c;">$2</span>;
            </div>
            
            <div style="margin-top:15px; background:#111; padding:12px; border-radius:5px; border-left:3px solid var(--success);">
                <div style="font-size:0.7rem; color:#666;">EXECUTION RESULT</div>
                <div style="font-size:0.9rem; color:var(--success); margin-top:5px;">UPDATE 1 | Time: 0.68ms</div>
                <div style="font-size:0.75rem; color:#bd93f9; margin-top:5px;">Only 1 column modified (efficient!)</div>
            </div>
        `,
        progress: 85
    },
    {
        title: "9. Atomic Execution",
        technical: `<strong>Atomik İşlem:</strong><br><br>
            Güncelleme işlemi veritabanında atomik olarak onaylanır.<br><br>
            <strong>Transaction:</strong><br>
            - Auto-commit mode<br>
            - ACID compliant<br>
            - Rollback on error`,
        component: `<strong>DB-Engine Commit</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--success); margin-bottom:8px;">TRANSACTION DURUMU</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Status:</td><td style="padding:3px; color:#50fa7b;">COMMITTED</td></tr>
                    <tr><td style="padding:3px;">WAL Write:</td><td style="padding:3px; color:#50fa7b;">SUCCESS</td></tr>
                    <tr><td style="padding:3px;">Rollback:</td><td style="padding:3px; color:#8be9fd;">NOT NEEDED</td></tr>
                </table>
            </div>`,
        content: `
            <div style="text-align: center; padding: 20px; background: rgba(16,185,129,0.05); border: 2px solid var(--success); border-radius: 15px;">
                <div style="width:60px; height:60px; background:var(--success); border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:2rem; color:#000; margin-bottom:15px;">✓</div>
                <div style="font-size: 1.2rem; color: var(--success); font-weight: bold;">COMMIT: SUCCESS</div>
                <div style="font-size: 0.8rem; color: #666; margin-top: 10px;">Değişiklik kalıcı olarak kaydedildi</div>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:15px;">
                <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Commit Time</div>
                    <div style="font-size:0.9rem; color:var(--success);">0.12ms</div>
                </div>
                <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">WAL Size</div>
                    <div style="font-size:0.9rem; color:#8be9fd;">64 bytes</div>
                </div>
                <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Durability</div>
                    <div style="font-size:0.9rem; color:var(--success);">FSYNC</div>
                </div>
            </div>
        `,
        progress: 95
    },
    {
        title: "10. Yanıt: 200 OK (Kısmi Güncelleme)",
        technical: `<strong>Başarılı Partial Update:</strong><br><br>
            Sadece belirtilen alan güncellendi. İstemciye 200 OK döndürülür.<br><br>
            <strong>Response:</strong><br>
            - Status: 200 OK<br>
            - Updated fields only<br>
            - Minimal response size`,
        component: `<strong>Final Result</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:#bd93f9; margin-bottom:8px;">YAŞAM DÖNGÜSÜ ÖZETİ</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Total Time:</td><td style="padding:3px; color:#50fa7b; text-align:right;">18.4ms</td></tr>
                    <tr><td style="padding:3px;">Network:</td><td style="padding:3px; color:#8be9fd; text-align:right;">15.2ms</td></tr>
                    <tr><td style="padding:3px;">Processing:</td><td style="padding:3px; color:#f1fa8c; text-align:right;">3.2ms</td></tr>
                </table>
            </div>`,
        content: `
            <div style="text-align: center; padding: 30px; background: rgba(189,147,249,0.05); border: 2px solid #bd93f9; border-radius: 15px;">
                <div style="font-size: 3rem; color: #bd93f9; font-weight: bold; margin-bottom: 15px;">200 OK</div>
                <div style="font-size: 1.2rem; color: rgba(255,255,255,0.8); margin-bottom: 20px;">KISMİ GÜNCELLEME BAŞARILI</div>
                
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-top:20px;">
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Toplam Süre</div>
                        <div style="font-size:1rem; color:var(--primary);">18.4ms</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Fields Updated</div>
                        <div style="font-size:1rem; color:#bd93f9;">1</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">DB Time</div>
                        <div style="font-size:1rem; color:var(--success);">0.68ms</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Bandwidth Saved</div>
                        <div style="font-size:1rem; color:var(--success);">86%</div>
                    </div>
                </div>
                
                <div style="margin-top: 25px; font-size: 0.8rem; opacity: 0.6;">[ Sadece 'status' alanı güncellendi ]</div>
            </div>
        `,
        progress: 100
    }
];

const deleteStages = [
    {
        title: "1. DELETE İsteği: Kaynak Silme Başlatıldı",
        technical: `<strong>RFC 7231 §4.3.5 - DELETE</strong><br><br>
            Belirtilen kaynağı tamamen kaldırmak için kullanılır. Genelde gövde içermez.<br><br>
            <strong>Özellikler:</strong><br>
            - <strong>Idempotent:</strong> Evet (aynı ID'ye tekrar DELETE = aynı sonuç)<br>
            - <strong>Body:</strong> Genellikle boş<br>
            - <strong>Destructive:</strong> Geri alınamaz<br><br>
            <strong>Proje Endpoint:</strong><br>
            <code>router.HandleFunc("/api/v1/devices/{id}", handlers.DeleteDevice).Methods("DELETE")</code>`,
        component: `<strong>DELETE Request Headers</strong><br><br>
            <div style="background:#000; padding:12px; border-radius:8px; border:1px solid #333; font-family:monospace; font-size:0.7rem; line-height:1.5;">
                <span style="color:var(--danger);">DELETE</span> /api/v1/devices/550e8400-e29b... HTTP/1.1<br>
                <span style="color:#8be9fd;">Host:</span> localhost:3000<br>
                <span style="color:#8be9fd;">Authorization:</span> Bearer eyJhbGciOiJIUzI1NiIs...<br>
                <span style="color:#8be9fd;">X-Request-ID:</span> del-550e8400-e29b-41d4...<br>
                <span style="color:#8be9fd;">X-Confirm-Delete:</span> true
            </div>`,
        content: `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 1.2rem; color: var(--danger); font-weight: bold; border: 2px solid var(--danger); padding: 15px 30px; border-radius: 8px; display: inline-block; background: rgba(239,68,68,0.05);">
                    İSTEMCİ -> [ HTTP DELETE (NO BODY) ] -> SUNUCU
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.7rem; color:var(--danger); margin-bottom:10px; font-weight:bold;">DELETE vs OTHER METHODS</div>
                    <table style="width:100%; font-size:0.75rem; border-collapse:collapse;">
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">DELETE Body</td><td style="padding:5px; border-bottom:1px solid #333; color:var(--danger);">0 bytes</td></tr>
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">POST Body</td><td style="padding:5px; border-bottom:1px solid #333; color:#ff79c6;">~156 bytes</td></tr>
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">PUT Body</td><td style="padding:5px; border-bottom:1px solid #333; color:var(--warning);">~198 bytes</td></tr>
                        <tr><td style="padding:5px;">Irreversible</td><td style="padding:5px; color:var(--danger);">YES ⚠️</td></tr>
                    </table>
                </div>
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.7rem; color:var(--warning); margin-bottom:10px; font-weight:bold;">TIMING BREAKDOWN</div>
                    <div style="font-size:0.75rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>DNS Lookup:</span><span style="color:#50fa7b;">2.1ms</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>TCP Connect:</span><span style="color:#50fa7b;">4.3ms</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>TLS Handshake:</span><span style="color:#50fa7b;">12.8ms</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>Request Sent:</span><span style="color:#50fa7b;">0.1ms</span></div>
                    </div>
                </div>
            </div>
            
            <div style="background:#000; padding:15px; border-radius:8px; border:1px solid var(--danger); font-family:monospace; font-size:0.75rem;">
                <div style="color:var(--danger); margin-bottom:10px; font-weight:bold;">⚠️ DESTRUCTIVE OPERATION</div>
                <div style="color:#666;">Request Body: <span style="color:var(--danger);">EMPTY</span></div>
                <div style="color:#666; margin-top:5px;">Target: <span style="color:#f1fa8c;">550e8400-e29b-41d4-a716-446655440000</span></div>
            </div>
            
            <div style="margin-top:10px; padding:8px; background:rgba(239,68,68,0.1); border-radius:4px; font-size:0.7rem;">
                <strong>cURL Equivalent:</strong><br>
                <code style="color:#f1fa8c;">curl -X DELETE "http://localhost:3000/api/v1/devices/550e8400..." -H "Authorization: Bearer TOKEN" -H "X-Confirm-Delete: true"</code>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:10px; margin-top:15px;">
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Body Size</div>
                    <div style="font-size:1rem; color:var(--danger);">0 bytes</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Target ID</div>
                    <div style="font-size:0.8rem; color:#8be9fd;">550e84...</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Method</div>
                    <div style="font-size:1rem; color:var(--danger);">DELETE</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid var(--danger);">
                    <div style="font-size:0.6rem; color:#666;">Reversible</div>
                    <div style="font-size:0.8rem; color:var(--danger);">NO ⚠️</div>
                </div>
            </div>
        `,
        progress: 10
    },
    {
        title: "2. Control Signals (TCP Layer)",
        technical: `<strong>TCP Control Sinyalleri:</strong><br><br>
            DELETE isteği minimal payload ile gönderilir. TCP seviyesinde kontrol sinyalleri izlenir.<br><br>
            <strong>Sinyaller:</strong><br>
            - PSH: Push data immediately<br>
            - ACK: Acknowledge receipt<br>
            - No body = faster transmission`,
        component: `<strong>Network Stack (Minimal)</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--danger); margin-bottom:8px;">SEGMENT BİLGİLERİ</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Total Segments:</td><td style="padding:3px; color:#50fa7b; text-align:right;">1</td></tr>
                    <tr><td style="padding:3px;">Payload Size:</td><td style="padding:3px; color:var(--danger); text-align:right;">0 bytes</td></tr>
                    <tr><td style="padding:3px;">Header Only:</td><td style="padding:3px; color:#8be9fd; text-align:right;">~200 bytes</td></tr>
                </table>
            </div>`,
        content: `
            <div class="packet visible" style="border: 2px solid var(--danger); padding: 15px; border-radius: 10px; background: rgba(239,68,68,0.05);">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05); width:120px;"><strong>FRAME (L2)</strong></td><td style="border: 1px solid #444; padding: 8px;">Dest MAC: <span style="color:#8be9fd;">00:50:56:C0:00:08</span> | Src MAC: <span style="color:#8be9fd;">44:37:E6:32:A1:B2</span> | EtherType: 0x0800</td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05);"><strong>PACKET (L3)</strong></td><td style="border: 1px solid #444; padding: 8px;">Src IP: <span style="color:#50fa7b;">192.168.1.10</span> | Dest IP: <span style="color:#50fa7b;">127.0.0.1</span> | TTL: 64 | Protocol: TCP(6)</td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05);"><strong>SEGMENT (L4)</strong></td><td style="border: 1px solid #444; padding: 8px;">Src Port: <span style="color:#f1fa8c;">54325</span> | Dest Port: <span style="color:#f1fa8c;">3000</span> | Seq: 4001 | Ack: 1 | Flags: <span style="color:var(--danger);">[PSH, ACK]</span></td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(239,68,68,0.2);"><strong>PAYLOAD (L7)</strong></td><td style="border: 1px solid #444; padding: 8px;">DELETE /api/v1/devices/{id} <span style="color:var(--danger);">(NO BODY)</span></td></tr>
                </table>
            </div>
            
            <div style="margin-top:15px; background:#000; padding:10px; border-radius:5px; font-family:monospace; font-size:0.6rem; color:#666;">
                <div style="color:var(--danger); margin-bottom:5px;">HEX DUMP (DELETE Request - HEADERS ONLY):</div>
                <div style="line-height:1.4;">
                    0000: <span style="color:#8be9fd;">00 50 56 c0 00 08</span> <span style="color:#f1fa8c;">44 37 e6 32 a1 b2</span> <span style="color:#50fa7b;">08 00</span> 45 00<br>
                    0010: 00 28 1c 4a 40 00 40 06 00 00 c0 a8 01 0a 7f 00<br>
                    0020: 00 01 d4 35 0b b8 <span style="color:var(--danger);">44 45 4C 45 54 45 20 2F</span>
                </div>
                <div style="margin-top:5px; font-size:0.55rem; color:#666;">
                    <span style="color:var(--danger);">44 45 4C 45 54 45 20 2F</span> = <span style="color:#f1fa8c;">DELETE /</span> (HTTP method start - NO JSON BODY)
                </div>
            </div>
            
            <div style="margin-top:10px; text-align:center; font-size:0.75rem; color:var(--success);">[ MINIMAL PAYLOAD - HEADERS ONLY | CRC32: 0x8E7F6051 ]</div>
        `,
        progress: 20
    },
    {
        title: "3. Security Check (Admin Verification)",
        technical: `<strong>Yetki Kontrolü (Kritik):</strong><br><br>
            DELETE işlemi yüksek yetki gerektirir. Admin rolü doğrulanır.<br><br>
            <strong>Güvenlik:</strong><br>
            - Role: admin required<br>
            - Permission: devices:delete<br>
            - Audit: Enabled`,
        component: `<strong>TLS/Auth Layer</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--danger); margin-bottom:8px;">YETKİ KONTROLÜ (KRİTİK)</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">User:</td><td style="padding:3px; color:#50fa7b;">yasin</td></tr>
                    <tr><td style="padding:3px;">Role:</td><td style="padding:3px; color:var(--danger);">admin</td></tr>
                    <tr><td style="padding:3px;">Permission:</td><td style="padding:3px; color:#f1fa8c;">devices:delete</td></tr>
                    <tr><td style="padding:3px;">Result:</td><td style="padding:3px; color:var(--success);">VERIFIED</td></tr>
                </table>
            </div>`,
        content: `
            <div style="padding: 20px; text-align: center;">
                <div style="font-size:0.7rem; color:#666; margin-bottom:15px;">ADMIN PRIVILEGE VERIFICATION</div>
                
                <div style="border: 2px solid var(--primary); padding: 15px; border-radius: 50px; margin-bottom: 8px; background: rgba(0,173,216,0.05);">
                    <span style="color:var(--primary); font-size:0.8rem;">1. JWT Token Valid</span>
                    <span style="float:right; font-size:0.65rem; color:var(--success);">PASSED</span>
                </div>
                <div style="border: 2px solid var(--danger); padding: 15px; border-radius: 50px; margin-bottom: 8px; background: rgba(239,68,68,0.05);">
                    <span style="color:var(--danger); font-size:0.8rem;">2. Role === 'admin'</span>
                    <span style="float:right; font-size:0.65rem; color:var(--success);">VERIFIED</span>
                </div>
                <div style="border: 2px solid var(--success); padding: 15px; border-radius: 50px; background: rgba(16,185,129,0.15);">
                    <span style="color:var(--success); font-size:0.9rem; font-weight:bold;">3. devices:delete -> AUTHORIZED</span>
                </div>
            </div>
            
            <div style="margin-top:10px; padding:10px; background:rgba(239,68,68,0.1); border:1px solid var(--danger); border-radius:5px; text-align:center; font-size:0.75rem;">
                <span style="color:var(--danger);">⚠️ Critical Operation:</span> <span style="color:#f1fa8c;">Requires admin privileges</span>
            </div>
        `,
        progress: 30
    },
    {
        title: "4. DeleteDevice Handler",
        technical: `<strong>Go Handler:</strong><br><br>
            <code>DeleteDevice</code> handler'ı tetiklenir. ID alınır ve silme işlemi başlatılır.<br><br>
            <strong>İşlem Akışı:</strong><br>
            - URL'den ID çıkar<br>
            - Existence check<br>
            - FK constraints check<br>
            - Execute delete`,
        component: `<strong>internal/api/handlers/devices.go</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--danger); margin-bottom:8px;">HANDLER METADATA</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Function:</td><td style="padding:3px; color:#50fa7b;">DeleteDevice</td></tr>
                    <tr><td style="padding:3px;">Method:</td><td style="padding:3px; color:var(--danger);">DELETE</td></tr>
                    <tr><td style="padding:3px;">Path Param:</td><td style="padding:3px; color:#8be9fd;">{id}</td></tr>
                    <tr><td style="padding:3px;">Return:</td><td style="padding:3px; color:#f1fa8c;">204 No Content</td></tr>
                </table>
            </div>`,
        content: `
            <div class="code-block">
                <span class="comment">// internal/api/handlers/devices.go</span><br>
                <span class="keyword">func</span> <span class="function">DeleteDevice</span>(w http.ResponseWriter, r *http.Request) {<br>
                &nbsp;&nbsp;vars := mux.Vars(r)<br>
                &nbsp;&nbsp;id := vars[<span class="string">"id"</span>]<br><br>
                &nbsp;&nbsp;<span class="comment">// Silme işlemini gerçekleştir</span><br>
                &nbsp;&nbsp;result, err := repo.Delete(id)<br>
                &nbsp;&nbsp;<span class="keyword">if</span> err != nil {<br>
                &nbsp;&nbsp;&nbsp;&nbsp;http.Error(w, err.Error(), http.StatusInternalServerError)<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">return</span><br>
                &nbsp;&nbsp;}<br><br>
                &nbsp;&nbsp;<span class="comment">// 204 No Content döndür</span><br>
                &nbsp;&nbsp;w.WriteHeader(http.StatusNoContent)<br>
                }
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:15px;">
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">ID Extract</div>
                    <div style="font-size:1rem; color:var(--success);">0.01ms</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid var(--danger);">
                    <div style="font-size:0.6rem; color:#666;">Operation</div>
                    <div style="font-size:1rem; color:var(--danger);">DELETE</div>
                </div>
            </div>
        `,
        progress: 40
    },
    {
        title: "5. ID Verification",
        technical: `<strong>ID Doğrulama:</strong><br><br>
            Silinecek kaynağın ID'si URL'den çıkarılır ve doğrulanır.<br><br>
            <strong>Kontroller:</strong><br>
            - Valid UUID format<br>
            - Resource exists<br>
            - Not already deleted`,
        component: `<strong>mux.Vars - ID Extraction</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--primary); margin-bottom:8px;">ID DOĞRULAMA</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">ID:</td><td style="padding:3px; color:#f1fa8c;">550e8400-e29b-41d4...</td></tr>
                    <tr><td style="padding:3px;">Format:</td><td style="padding:3px; color:#50fa7b;">Valid UUID v4</td></tr>
                    <tr><td style="padding:3px;">Exists:</td><td style="padding:3px; color:#50fa7b;">YES</td></tr>
                </table>
            </div>`,
        content: `
            <div style="background: #000; padding: 20px; border-radius: 10px; border: 1px solid #333;">
                <div style="font-size: 0.8rem; margin-bottom: 15px; border-bottom: 1px solid #222; padding-bottom: 8px; color: var(--danger); font-weight:bold;">MUX ROUTING TABLE (DELETE)</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display:flex; justify-content:space-between; padding: 8px 12px; background: rgba(245,158,11,0.1); border-radius: 4px; color: var(--warning);">
                        <span>PUT /api/v1/devices/{id}</span><span style="opacity:0.6;">[SKIP]</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding: 8px 12px; background: rgba(189,147,249,0.1); border-radius: 4px; color: #bd93f9;">
                        <span>PATCH /api/v1/devices/{id}</span><span style="opacity:0.6;">[SKIP]</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding: 10px 12px; background: rgba(239,68,68,0.15); border: 2px solid var(--danger); border-radius: 4px; color: var(--danger); font-weight: bold;">
                        <span>DELETE /api/v1/devices/{id}</span><span>[EŞLEŞTİ]</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-top:15px; padding:10px; background:rgba(239,68,68,0.1); border:1px solid var(--danger); border-radius:5px; text-align:center; font-size:0.8rem;">
                <span style="color:var(--danger);">Target ID:</span> <code style="color:#f1fa8c;">550e8400-e29b-41d4-a716-446655440000</code>
            </div>
        `,
        progress: 50
    },
    {
        title: "6. Audit Logging",
        technical: `<strong>Denetim Kaydı:</strong><br><br>
            DELETE işlemleri audit log'a kaydedilir. Kim, ne zaman, neyi sildi bilgisi saklanır.<br><br>
            <strong>Log Bilgileri:</strong><br>
            - User ID<br>
            - Resource ID<br>
            - Timestamp<br>
            - IP Address`,
        component: `<strong>Audit Logger</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--warning); margin-bottom:8px;">AUDIT KAYDI</div>
                <div style="font-family:monospace; font-size:0.6rem; color:#666;">
                    [AUDIT] 2026-02-04 14:55:32<br>
                    [AUDIT] action=DELETE<br>
                    [AUDIT] resource=devices/550e8400...<br>
                    [AUDIT] user=yasin (admin)<br>
                    [AUDIT] ip=192.168.1.10
                </div>
            </div>`,
        content: `
            <div style="background:#000; padding:20px; border-radius:10px; border:1px solid var(--warning);">
                <div style="display:flex; align-items:center; gap:15px; margin-bottom:15px;">
                    <div style="width:50px; height:50px; background:var(--warning); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.5rem; color:#000;">📋</div>
                    <div>
                        <div style="font-size:1.1rem; color:var(--warning); font-weight:bold;">AUDIT LOG RECORDED</div>
                        <div style="font-size:0.75rem; color:#666;">Silme işlemi kayıt altına alındı</div>
                    </div>
                </div>
                
                <div style="background:#111; padding:12px; border-radius:5px; font-family:monospace; font-size:0.7rem; line-height:1.6;">
                    <div><span style="color:var(--warning);">[AUDIT]</span> timestamp: <span style="color:#8be9fd;">2026-02-04T14:55:32Z</span></div>
                    <div><span style="color:var(--warning);">[AUDIT]</span> action: <span style="color:var(--danger);">DELETE</span></div>
                    <div><span style="color:var(--warning);">[AUDIT]</span> resource: <span style="color:#f1fa8c;">devices/550e8400-e29b...</span></div>
                    <div><span style="color:var(--warning);">[AUDIT]</span> user: <span style="color:#50fa7b;">yasin (role: admin)</span></div>
                    <div><span style="color:var(--warning);">[AUDIT]</span> ip: <span style="color:#8be9fd;">192.168.1.10</span></div>
                </div>
            </div>
        `,
        progress: 60
    },
    {
        title: "7. Integrity Control (FK Constraints)",
        technical: `<strong>Referential Integrity:</strong><br><br>
            Silme öncesi Foreign Key bağımlılıkları kontrol edilir.<br><br>
            <strong>Kontroller:</strong><br>
            - interfaces table (device_id FK)<br>
            - vlans table (device_id FK)<br>
            - CASCADE or RESTRICT`,
        component: `<strong>DB Logic - FK Check</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--primary); margin-bottom:8px;">FK CONSTRAINTS</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">interfaces:</td><td style="padding:3px; color:#50fa7b;">0 refs</td></tr>
                    <tr><td style="padding:3px;">vlans:</td><td style="padding:3px; color:#50fa7b;">0 refs</td></tr>
                    <tr><td style="padding:3px;">Status:</td><td style="padding:3px; color:var(--success);">CAN DELETE</td></tr>
                </table>
            </div>`,
        content: `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.75rem; color:var(--primary); margin-bottom:10px; font-weight:bold;">FK BAĞIMLILIK KONTROLÜ</div>
                    <div style="display:flex; flex-direction:column; gap:8px; font-size:0.7rem;">
                        <div style="display:flex; justify-content:space-between; padding:5px; background:#000; border-radius:3px;">
                            <span>interfaces.device_id</span>
                            <span style="color:var(--success);">0 refs ✓</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:5px; background:#000; border-radius:3px;">
                            <span>vlans.device_id</span>
                            <span style="color:var(--success);">0 refs ✓</span>
                        </div>
                    </div>
                </div>
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid var(--success);">
                    <div style="font-size:0.75rem; color:var(--success); margin-bottom:10px; font-weight:bold;">CONSTRAINT SONUCU</div>
                    <div style="text-align:center; padding:15px;">
                        <div style="font-size:2rem; color:var(--success);">✓</div>
                        <div style="font-size:0.8rem; color:var(--success); margin-top:5px;">NO DEPENDENCIES</div>
                        <div style="font-size:0.65rem; color:#666;">Safe to delete</div>
                    </div>
                </div>
            </div>
            
            <div class="code-block" style="margin-top:15px; font-size:0.7rem;">
                <span class="comment">// Pre-delete check</span><br>
                <span class="keyword">SELECT COUNT</span>(*) <span class="keyword">FROM</span> interfaces <span class="keyword">WHERE</span> device_id = $1;<br>
                <span class="comment">// Result: 0 (no dependencies)</span>
            </div>
        `,
        progress: 70
    },
    {
        title: "8. SQL DELETE Operation",
        technical: `<strong>Fiziksel Silme:</strong><br><br>
            Kayıt veritabanından fiziksel olarak silinir (hard delete).<br><br>
            <strong>İşlem:</strong><br>
            - DELETE FROM devices<br>
            - WHERE id = $1<br>
            - RETURNING for confirmation`,
        component: `<strong>PostgreSQL DELETE</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--danger); margin-bottom:8px;">DELETE PERFORMANSI</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Execution Time:</td><td style="padding:3px; color:#50fa7b; text-align:right;">0.45ms</td></tr>
                    <tr><td style="padding:3px;">Rows Affected:</td><td style="padding:3px; color:var(--danger); text-align:right;">1</td></tr>
                    <tr><td style="padding:3px;">Type:</td><td style="padding:3px; color:var(--danger); text-align:right;">HARD DELETE</td></tr>
                </table>
            </div>`,
        content: `
            <div class="db-query" style="background:#000; padding:15px; border-radius:8px; border:1px solid var(--danger); font-family:monospace;">
                <div style="color:var(--danger); margin-bottom:10px; font-weight:bold;">SQL DELETE STATEMENT</div>
                <span style="color:#ff79c6;">DELETE FROM</span> devices<br>
                <span style="color:#ff79c6;">WHERE</span> id = <span style="color:#f1fa8c;">$1</span><br>
                <span style="color:#ff79c6;">RETURNING</span> id, hostname;
            </div>
            
            <div style="margin-top:15px; background:#111; padding:12px; border-radius:5px; border-left:3px solid var(--danger);">
                <div style="font-size:0.7rem; color:#666;">EXECUTION RESULT</div>
                <div style="font-size:0.9rem; color:var(--danger); margin-top:5px;">DELETE 1 | Time: 0.45ms</div>
                <div style="font-size:0.75rem; color:#f1fa8c; margin-top:5px;">Deleted: IST-RTR-01 (550e8400-e29b...)</div>
            </div>
            
            <div style="margin-top:10px; padding:8px; background:rgba(239,68,68,0.1); border-radius:5px; text-align:center; font-size:0.7rem;">
                <span style="color:var(--danger);">⚠️ IRREVERSIBLE:</span> <span style="color:#666;">Bu işlem geri alınamaz</span>
            </div>
        `,
        progress: 85
    },
    {
        title: "9. Transaction Commit",
        technical: `<strong>Kalıcı Silme:</strong><br><br>
            Transaction commit edilir. Veri kalıcı olarak silinir.<br><br>
            <strong>İşlem:</strong><br>
            - WAL write<br>
            - Disk sync<br>
            - Transaction complete`,
        component: `<strong>DB-Engine Commit</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--success); margin-bottom:8px;">TRANSACTION DURUMU</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Status:</td><td style="padding:3px; color:#50fa7b;">COMMITTED</td></tr>
                    <tr><td style="padding:3px;">WAL:</td><td style="padding:3px; color:#50fa7b;">SYNCED</td></tr>
                    <tr><td style="padding:3px;">Vacuum:</td><td style="padding:3px; color:#8be9fd;">PENDING</td></tr>
                </table>
            </div>`,
        content: `
            <div style="text-align: center; padding: 20px; background: rgba(239,68,68,0.05); border: 2px solid var(--danger); border-radius: 15px;">
                <div style="width:60px; height:60px; background:var(--danger); border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:2rem; color:#fff; margin-bottom:15px;">🗑️</div>
                <div style="font-size: 1.2rem; color: var(--danger); font-weight: bold;">PERMANENTLY DELETED</div>
                <div style="font-size: 0.8rem; color: #666; margin-top: 10px;">Kayıt kalıcı olarak silindi</div>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:15px;">
                <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Commit Time</div>
                    <div style="font-size:0.9rem; color:var(--success);">0.08ms</div>
                </div>
                <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">WAL Write</div>
                    <div style="font-size:0.9rem; color:var(--success);">SUCCESS</div>
                </div>
                <div style="background:#111; padding:8px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Disk Sync</div>
                    <div style="font-size:0.9rem; color:var(--success);">FSYNC</div>
                </div>
            </div>
        `,
        progress: 95
    },
    {
        title: "10. Yanıt: 204 No Content",
        technical: `<strong>Başarılı Silme:</strong><br><br>
            Kayıt başarıyla silindi. 204 No Content döndürülür (body yok).<br><br>
            <strong>Response:</strong><br>
            - Status: 204 No Content<br>
            - Body: Empty<br>
            - Content-Length: 0`,
        component: `<strong>Final Result</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--danger); margin-bottom:8px;">YAŞAM DÖNGÜSÜ ÖZETİ</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Total Time:</td><td style="padding:3px; color:#50fa7b; text-align:right;">15.2ms</td></tr>
                    <tr><td style="padding:3px;">Network:</td><td style="padding:3px; color:#8be9fd; text-align:right;">12.8ms</td></tr>
                    <tr><td style="padding:3px;">Processing:</td><td style="padding:3px; color:#f1fa8c; text-align:right;">2.4ms</td></tr>
                </table>
            </div>`,
        content: `
            <div style="text-align: center; padding: 30px; background: rgba(239,68,68,0.05); border: 2px solid var(--danger); border-radius: 15px;">
                <div style="font-size: 3rem; color: var(--danger); font-weight: bold; margin-bottom: 15px;">204</div>
                <div style="font-size: 1.2rem; color: rgba(255,255,255,0.8); margin-bottom: 20px;">NO CONTENT - KAYIT SİLİNDİ</div>
                
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-top:20px;">
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Toplam Süre</div>
                        <div style="font-size:1rem; color:var(--primary);">15.2ms</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Response Body</div>
                        <div style="font-size:1rem; color:var(--danger);">EMPTY</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">DB Time</div>
                        <div style="font-size:1rem; color:var(--success);">0.45ms</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Audit Logged</div>
                        <div style="font-size:1rem; color:var(--success);">YES</div>
                    </div>
                </div>
                
                <div style="margin-top: 25px; font-size: 0.8rem; opacity: 0.6;">[ Cihaz kalıcı olarak silindi ]</div>
            </div>
        `,
        progress: 100
    }
];

// ============================================================================
// LOGIN METODU - SÜPER FORM (10 AŞAMA)
// JWT Authentication, Password Verification, Cookie Management
// ============================================================================

const loginStages = [
    {
        title: "1. LOGIN İsteği: Kimlik Doğrulama Başlatıldı",
        technical: `<strong>RFC 7617 - HTTP Basic Authentication / RFC 6749 - OAuth 2.0</strong><br><br>
            <strong>Amaç:</strong> İstemci, sunucuya kimlik bilgilerini gönderir. Sunucu bu bilgileri doğrular ve JWT (JSON Web Token) üretir. Projede <code>/api/v1/users/login</code> endpoint'i kullanılır.<br><br>
            <strong>JWT Özellikleri (RFC 7519):</strong><br>
            - <strong>Algorithm:</strong> HS256 (HMAC-SHA256)<br>
            - <strong>Expiration:</strong> 24 saat (configurable)<br>
            - <strong>Claims:</strong> uid, user, role + RegisteredClaims<br><br>
            <strong>Proje Endpoint:</strong><br>
            <code>router.HandleFunc("/api/v1/users/login", handlers.LoginHandler).Methods("POST")</code>`,
        component: `<strong>HTTP İstemci (Request Headers)</strong><br><br>
            <div style="background:#000; padding:15px; border-radius:8px; border:1px solid #333; font-family:'Fira Code', monospace; font-size:0.75rem; line-height:1.6;">
                <span style="color:#50fa7b;">POST</span> /api/v1/users/login HTTP/1.1<br>
                <span style="color:#8be9fd;">Host:</span> localhost:3000<br>
                <span style="color:#8be9fd;">Content-Type:</span> application/json<br>
                <span style="color:#8be9fd;">Content-Length:</span> 52<br>
                <span style="color:#8be9fd;">User-Agent:</span> PostmanRuntime/7.32.3<br>
                <span style="color:#8be9fd;">Accept:</span> application/json<br>
                <span style="color:#8be9fd;">X-Request-ID:</span> login-req-550e8400-e29b-41d4<br>
                <span style="color:#8be9fd;">Connection:</span> keep-alive
            </div>
            <div style="margin-top:10px; padding:8px; background:rgba(16,185,129,0.1); border-radius:4px; font-size:0.7rem;">
                <strong>cURL Equivalent:</strong><br>
                <code style="color:#f1fa8c;">curl -X POST "http://localhost:3000/api/v1/users/login" -H "Content-Type: application/json" -d '{"username":"admin","password":"secret123"}'</code>
            </div>`,
        content: `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 1.2rem; color: var(--success); font-weight: bold; border: 2px solid var(--success); padding: 15px 30px; border-radius: 8px; display: inline-block; background: rgba(16,185,129,0.05);">
                    [ AUTH ] İSTEMCİ -> [ LOGIN REQUEST ] -> SUNUCU
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.7rem; color:var(--success); margin-bottom:10px; font-weight:bold;">REQUEST BODY (CREDENTIALS)</div>
                    <div style="background:#000; padding:10px; border-radius:5px; font-family:monospace; font-size:0.75rem;">
                        {<br>
                        &nbsp;&nbsp;<span style="color:#50fa7b;">"username"</span>: <span style="color:#f1fa8c;">"admin"</span>,<br>
                        &nbsp;&nbsp;<span style="color:#50fa7b;">"password"</span>: <span style="color:#f1fa8c;">"********"</span><br>
                        }
                    </div>
                </div>
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.7rem; color:var(--warning); margin-bottom:10px; font-weight:bold;">TIMING BREAKDOWN</div>
                    <div style="font-size:0.75rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>DNS Lookup:</span><span style="color:#50fa7b;">2.1ms</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>TCP Connect:</span><span style="color:#50fa7b;">4.3ms</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>TLS Handshake:</span><span style="color:#50fa7b;">12.8ms</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>Request Sent:</span><span style="color:#50fa7b;">0.5ms</span></div>
                    </div>
                </div>
            </div>
            
            <div class="code-block">
                <span class="comment">// Proje handler: internal/api/handlers/users.go -> LoginHandler()</span><br>
                <span class="keyword">func</span> <span class="function">LoginHandler</span>(w http.ResponseWriter, r *http.Request) {<br>
                &nbsp;&nbsp;<span class="keyword">var</span> req models.User<br>
                &nbsp;&nbsp;<span class="keyword">if</span> err := json.NewDecoder(r.Body).Decode(&req); err != <span class="keyword">nil</span> {<br>
                &nbsp;&nbsp;&nbsp;&nbsp;pkgutils.JSONError(w, <span class="string">"Invalid request body"</span>, 400)<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">return</span><br>
                &nbsp;&nbsp;}<br>
                &nbsp;&nbsp;<span class="keyword">defer</span> r.Body.Close()<br>
                &nbsp;&nbsp;<br>
                &nbsp;&nbsp;<span class="comment">// Validate required fields</span><br>
                &nbsp;&nbsp;<span class="keyword">if</span> req.Username == <span class="string">""</span> || req.Password == <span class="string">""</span> {<br>
                &nbsp;&nbsp;&nbsp;&nbsp;pkgutils.JSONError(w, <span class="string">"Username and password are required"</span>, 400)<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="keyword">return</span><br>
                &nbsp;&nbsp;}<br>
                &nbsp;&nbsp;...<br>
                }
            </div>
            
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-top:15px;">
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Method</div>
                    <div style="font-size:1rem; color:var(--success);">POST</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Body Size</div>
                    <div style="font-size:1rem; color:#8be9fd;">52 bytes</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Content-Type</div>
                    <div style="font-size:0.8rem; color:#f1fa8c;">JSON</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid var(--success);">
                    <div style="font-size:0.6rem; color:#666;">Endpoint</div>
                    <div style="font-size:0.8rem; color:var(--success);">/login</div>
                </div>
            </div>
        `,
        progress: 10
    },
    {
        title: "2. TLS 1.3 Şifreleme (RFC 8446)",
        technical: `<strong>Transport Layer Security (RFC 8446)</strong><br><br>
            <strong>Amaç:</strong> Şifre gibi hassas veriler TLS 1.3 ile şifrelenerek iletilir. Man-in-the-Middle (MITM) saldırıları engellenir.<br><br>
            <strong>TLS 1.3 Özellikleri:</strong><br>
            - <strong>Cipher Suite:</strong> TLS_AES_256_GCM_SHA384<br>
            - <strong>Key Exchange:</strong> X25519 (ECDHE)<br>
            - <strong>Perfect Forward Secrecy:</strong> Enabled<br>
            - <strong>0-RTT:</strong> Disabled (security)<br><br>
            <strong>OSI Layer:</strong> L5-L6 (Session/Presentation)`,
        component: `<strong>TLS Handshake Details</strong><br><br>
            <div style="background:#111; padding:12px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--success); margin-bottom:8px;">TLS 1.3 CIPHER SUITE</div>
                <table style="width:100%; font-size:0.65rem; border-collapse:collapse;">
                    <tr><td style="padding:4px; border-bottom:1px solid #333;">Protocol:</td><td style="padding:4px; border-bottom:1px solid #333; color:#50fa7b;">TLS 1.3</td></tr>
                    <tr><td style="padding:4px; border-bottom:1px solid #333;">Cipher:</td><td style="padding:4px; border-bottom:1px solid #333; color:#8be9fd;">AES-256-GCM</td></tr>
                    <tr><td style="padding:4px; border-bottom:1px solid #333;">Key Exchange:</td><td style="padding:4px; border-bottom:1px solid #333; color:#f1fa8c;">X25519</td></tr>
                    <tr><td style="padding:4px; border-bottom:1px solid #333;">MAC:</td><td style="padding:4px; border-bottom:1px solid #333; color:#bd93f9;">SHA384</td></tr>
                    <tr><td style="padding:4px;">PFS:</td><td style="padding:4px; color:var(--success);">ENABLED</td></tr>
                </table>
            </div>`,
        content: `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="padding: 15px 30px; border: 3px solid var(--success); border-radius: 50px; background: rgba(16,185,129,0.1); display: inline-block;">
                    <span style="color: var(--success); font-weight: bold; letter-spacing: 2px; font-size:1rem;">[ TLS 1.3 ] CREDENTIALS ENCRYPTED</span>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.7rem; color:var(--success); margin-bottom:10px; font-weight:bold;">TLS HANDSHAKE PHASES</div>
                    <div style="font-size:0.7rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>1. ClientHello:</span><span style="color:#50fa7b;">SENT</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>2. ServerHello:</span><span style="color:#50fa7b;">RECEIVED</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>3. Certificate:</span><span style="color:#50fa7b;">VERIFIED</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>4. Key Exchange:</span><span style="color:#50fa7b;">X25519</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>5. Finished:</span><span style="color:#50fa7b;">COMPLETE</span></div>
                    </div>
                </div>
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.7rem; color:var(--warning); margin-bottom:10px; font-weight:bold;">ENCRYPTION SPECS</div>
                    <table style="width:100%; font-size:0.7rem; border-collapse:collapse;">
                        <tr><td style="padding:4px;">Algorithm:</td><td style="padding:4px; color:#50fa7b; text-align:right;">AES-256-GCM</td></tr>
                        <tr><td style="padding:4px;">Key Size:</td><td style="padding:4px; color:#8be9fd; text-align:right;">256-bit</td></tr>
                        <tr><td style="padding:4px;">IV Size:</td><td style="padding:4px; color:#8be9fd; text-align:right;">12 bytes</td></tr>
                        <tr><td style="padding:4px;">Auth Tag:</td><td style="padding:4px; color:#bd93f9; text-align:right;">16 bytes</td></tr>
                    </table>
                </div>
            </div>
            
            <div style="background:#000; padding:12px; border-radius:5px; font-family:monospace; font-size:0.6rem; color:#666;">
                <div style="color:var(--success); margin-bottom:8px;">ENCRYPTED PAYLOAD (Password Protected):</div>
                <div style="line-height:1.5;">
                    0000: <span style="color:#8be9fd;">17 03 03 00 45</span> <span style="color:#f1fa8c;">00 00 00 00 00 00 00 01</span> <span style="color:var(--success);">** ** ** ** ** **</span><br>
                    0010: <span style="color:var(--success);">** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **</span><br>
                    0020: <span style="color:var(--success);">** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **</span><br>
                    <span style="color:#666;">[ Application Data: Encrypted with AES-256-GCM ]</span>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-top:15px;">
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Protocol</div>
                    <div style="font-size:0.9rem; color:#50fa7b;">TLS 1.3</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Cipher</div>
                    <div style="font-size:0.8rem; color:#8be9fd;">AES-256</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">ECDHE</div>
                    <div style="font-size:0.8rem; color:#f1fa8c;">X25519</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid var(--success);">
                    <div style="font-size:0.6rem; color:#666;">Password</div>
                    <div style="font-size:0.8rem; color:var(--success);">SAFE</div>
                </div>
            </div>
        `,
        progress: 20
    },
    {
        title: "3. JSON Parsing & Validation",
        technical: `<strong>Request Body İşleme:</strong><br><br>
            Go handler, gelen JSON'u models.User struct'ına decode eder ve gerekli alanları kontrol eder.<br><br>
            <strong>Validasyon:</strong><br>
            - Username: Required, non-empty<br>
            - Password: Required, non-empty<br>
            - Body format: Valid JSON`,
        component: `<strong>Go Handler - Decode</strong><br><br>
            <div style="background:#000; padding:10px; border-radius:5px; font-family:monospace; font-size:0.65rem; color:#f8f8f2;">
                <span style="color:#ff79c6;">var</span> req models.User<br>
                <span style="color:#ff79c6;">if</span> err := json.NewDecoder(r.Body).Decode(&req); err != <span style="color:#bd93f9;">nil</span> {<br>
                &nbsp;&nbsp;utils.JSONError(w, <span style="color:#f1fa8c;">"Invalid request body"</span>, 400)<br>
                &nbsp;&nbsp;<span style="color:#ff79c6;">return</span><br>
                }
            </div>`,
        content: `
            <div style="padding: 20px; text-align: center;">
                <div style="font-size:0.7rem; color:#666; margin-bottom:15px;">JSON PARSING FLOW</div>
                
                <div style="border: 2px solid var(--primary); padding: 15px; border-radius: 10px; margin-bottom: 10px; background: rgba(0,173,216,0.05);">
                    <span style="color:var(--primary); font-size:0.9rem;">1. r.Body → JSON Decoder</span>
                </div>
                <div style="font-size:1.5rem; color:#666;">↓</div>
                <div style="border: 2px solid var(--warning); padding: 15px; border-radius: 10px; margin-bottom: 10px; background: rgba(245,158,11,0.05);">
                    <span style="color:var(--warning); font-size:0.9rem;">2. models.User Struct</span>
                </div>
                <div style="font-size:1.5rem; color:#666;">↓</div>
                <div style="border: 2px solid var(--success); padding: 15px; border-radius: 10px; background: rgba(16,185,129,0.05);">
                    <span style="color:var(--success); font-size:0.9rem;">3. Validation Passed [OK]</span>
                </div>
            </div>
        `,
        progress: 30
    },
    {
        title: "4. Database User Lookup",
        technical: `<strong>Kullanıcı Sorgusu:</strong><br><br>
            Username veritabanında aranır. Güvenlik için "User not found" yerine genel "Invalid credentials" döndürülür.<br><br>
            <strong>Security Best Practice:</strong><br>
            - Timing attack prevention<br>
            - Generic error messages<br>
            - No user enumeration`,
        component: `<strong>SQL Query</strong><br><br>
            <div style="background:#000; padding:10px; border-radius:5px; font-family:monospace; font-size:0.65rem; color:#f8f8f2;">
                <span style="color:#50fa7b;">SELECT</span> id, username, password, role, inactive_status<br>
                <span style="color:#50fa7b;">FROM</span> users<br>
                <span style="color:#50fa7b;">WHERE</span> username = <span style="color:#f1fa8c;">$1</span>
            </div>`,
        content: `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.7rem; color:var(--primary); margin-bottom:10px; font-weight:bold;">DATABASE QUERY</div>
                    <div style="font-size:0.75rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>Table:</span><span style="color:#f1fa8c;">users</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>Index:</span><span style="color:#50fa7b;">username_idx</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>Query Time:</span><span style="color:#8be9fd;">0.42ms</span></div>
                    </div>
                </div>
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.7rem; color:var(--success); margin-bottom:10px; font-weight:bold;">USER FOUND [OK]</div>
                    <div style="font-size:0.75rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>ID:</span><span style="color:#f1fa8c;">uuid...</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>Role:</span><span style="color:#bd93f9;">admin</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>Active:</span><span style="color:var(--success);">true</span></div>
                    </div>
                </div>
            </div>
        `,
        progress: 40
    },
    {
        title: "5. Password Verification (Argon2)",
        technical: `<strong>Şifre Doğrulama:</strong><br><br>
            Veritabanındaki hash ile gelen şifre Argon2id algoritması kullanılarak karşılaştırılır.<br><br>
            <strong>Argon2 Parametreleri:</strong><br>
            - Memory: 64MB<br>
            - Iterations: 3<br>
            - Parallelism: 4<br>
            - Salt: 16 bytes random`,
        component: `<strong>Go Handler - Password Check</strong><br><br>
            <div style="background:#000; padding:10px; border-radius:5px; font-family:monospace; font-size:0.65rem; color:#f8f8f2;">
                match, err := pkgutils.CheckPassword(req.Password, user.Password)<br>
                <span style="color:#ff79c6;">if</span> !match {<br>
                &nbsp;&nbsp;utils.JSONError(w, <span style="color:#f1fa8c;">"Invalid credentials"</span>, 401)<br>
                &nbsp;&nbsp;<span style="color:#ff79c6;">return</span><br>
                }
            </div>`,
        content: `
            <div style="text-align: center; margin: 20px 0;">
                <div style="padding: 25px; border: 3px solid var(--warning); border-radius: 15px; background: rgba(245,158,11,0.05); display: inline-block;">
                    <div style="font-size:0.8rem; color:var(--warning); margin-bottom:15px;">ARGON2ID PASSWORD VERIFICATION</div>
                    <div style="display:flex; gap:20px; justify-content:center;">
                        <div style="text-align:center;">
                            <div style="font-size:0.6rem; color:#666;">Input</div>
                            <div style="font-size:1.5rem; color:#f1fa8c;">[INPUT]</div>
                            <div style="font-size:0.7rem; color:#f1fa8c;">secret123</div>
                        </div>
                        <div style="font-size:2rem; color:var(--warning);">→</div>
                        <div style="text-align:center;">
                            <div style="font-size:0.6rem; color:#666;">Hash</div>
                            <div style="font-size:1.5rem; color:#bd93f9;">[HASH]</div>
                            <div style="font-size:0.7rem; color:#bd93f9;">$argon2...</div>
                        </div>
                        <div style="font-size:2rem; color:var(--success);">=</div>
                        <div style="text-align:center;">
                            <div style="font-size:0.6rem; color:#666;">Result</div>
                            <div style="font-size:1.5rem; color:var(--success);">[OK]</div>
                            <div style="font-size:0.7rem; color:var(--success);">MATCH</div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        progress: 50
    },
    {
        title: "6. JWT Token Generation (RFC 7519)",
        technical: `<strong>JSON Web Token Standartları:</strong><br><br>
            JWT, kullanıcı kimlik bilgilerini güvenli bir şekilde taşımak için kullanılır. HS256 algoritması ile imzalanır.<br><br>
            <strong>Token Components (RFC 7519):</strong><br>
            - <strong>Header:</strong> {"alg":"HS256","typ":"JWT"}<br>
            - <strong>Payload:</strong> Custom claims + RegisteredClaims<br>
            - <strong>Signature:</strong> HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)<br><br>
            <strong>Proje Claims (pkg/utils/jwt.go → UserClaims):</strong><br>
            - uid: User ID (UUID)<br>
            - user: Username<br>
            - role: User role (admin/user)<br>
            - exp: Expiration time (24h default)`,
        component: `<strong>pkg/utils/jwt.go - Token Signing</strong><br><br>
            <div style="background:#000; padding:12px; border-radius:5px; font-family:monospace; font-size:0.6rem; color:#f8f8f2; line-height:1.5;">
                <span style="color:#6272a4;">// UserClaims defines custom JWT claims</span><br>
                <span style="color:#ff79c6;">type</span> UserClaims <span style="color:#ff79c6;">struct</span> {<br>
                &nbsp;&nbsp;UserID &nbsp;&nbsp;<span style="color:#8be9fd;">string</span> <span style="color:#f1fa8c;">\`json:"uid"\`</span><br>
                &nbsp;&nbsp;Username <span style="color:#8be9fd;">string</span> <span style="color:#f1fa8c;">\`json:"user"\`</span><br>
                &nbsp;&nbsp;Role &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#8be9fd;">string</span> <span style="color:#f1fa8c;">\`json:"role"\`</span><br>
                &nbsp;&nbsp;jwt.RegisteredClaims<br>
                }<br><br>
                <span style="color:#6272a4;">// SignToken generates JWT with HS256</span><br>
                <span style="color:#ff79c6;">func</span> SignToken(userID, username, role <span style="color:#8be9fd;">string</span>) (<span style="color:#8be9fd;">string</span>, <span style="color:#8be9fd;">error</span>) {<br>
                &nbsp;&nbsp;claims := UserClaims{...}<br>
                &nbsp;&nbsp;token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)<br>
                &nbsp;&nbsp;<span style="color:#ff79c6;">return</span> token.SignedString(jwtSecret)<br>
                }
            </div>`,
        content: `
            <div style="background:#000; padding:20px; border-radius:10px; border:1px solid var(--primary);">
                <div style="font-size:0.8rem; color:var(--primary); margin-bottom:15px; font-weight:bold; text-align:center;">JWT TOKEN STRUCTURE (RFC 7519)</div>
                
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; text-align:center; margin-bottom:20px;">
                    <div style="background:#111; padding:15px; border-radius:5px; border:2px solid #ff79c6;">
                        <div style="font-size:0.7rem; color:#ff79c6; font-weight:bold;">HEADER</div>
                        <div style="font-size:0.55rem; color:#f1fa8c; margin-top:8px; font-family:monospace;">eyJhbGciOi<br>JIUzI1NiIs<br>InR5cCI6Ikp<br>XVCJ9</div>
                        <div style="margin-top:8px; background:#222; padding:5px; border-radius:3px; font-size:0.55rem;">
                            { "alg": "HS256",<br>"typ": "JWT" }
                        </div>
                    </div>
                    <div style="background:#111; padding:15px; border-radius:5px; border:2px solid #bd93f9;">
                        <div style="font-size:0.7rem; color:#bd93f9; font-weight:bold;">PAYLOAD</div>
                        <div style="font-size:0.55rem; color:#f1fa8c; margin-top:8px; font-family:monospace;">eyJ1aWQiOi<br>IxMjM0NTY3<br>ODkwIiwidXN<br>lciI6ImFkbW</div>
                        <div style="margin-top:8px; background:#222; padding:5px; border-radius:3px; font-size:0.55rem;">
                            { "uid": "uuid",<br>"user": "admin",<br>"role": "admin" }
                        </div>
                    </div>
                    <div style="background:#111; padding:15px; border-radius:5px; border:2px solid var(--success);">
                        <div style="font-size:0.7rem; color:var(--success); font-weight:bold;">SIGNATURE</div>
                        <div style="font-size:0.55rem; color:#f1fa8c; margin-top:8px; font-family:monospace;">SflKxwRJSM<br>eKKF2QT4fw<br>pMeJf36POk6<br>yJV_adQssw5c</div>
                        <div style="margin-top:8px; background:#222; padding:5px; border-radius:3px; font-size:0.55rem;">
                            HMACSHA256(<br>header.payload,<br>secret)
                        </div>
                    </div>
                </div>
                
                <div style="background:#111; padding:15px; border-radius:5px; border:1px solid #444;">
                    <div style="font-size:0.7rem; color:var(--warning); margin-bottom:10px; font-weight:bold;">DECODED PAYLOAD CLAIMS</div>
                    <table style="width:100%; font-size:0.7rem; border-collapse:collapse;">
                        <tr><td style="padding:5px; border-bottom:1px solid #333; width:30%;">uid (UserID)</td><td style="padding:5px; border-bottom:1px solid #333; color:#8be9fd;">550e8400-e29b-41d4-a716-446655440000</td></tr>
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">user (Username)</td><td style="padding:5px; border-bottom:1px solid #333; color:#f1fa8c;">admin</td></tr>
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">role</td><td style="padding:5px; border-bottom:1px solid #333; color:#bd93f9;">admin</td></tr>
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">iat (IssuedAt)</td><td style="padding:5px; border-bottom:1px solid #333; color:#50fa7b;">1705326225 (2024-01-15T14:23:45Z)</td></tr>
                        <tr><td style="padding:5px; border-bottom:1px solid #333;">nbf (NotBefore)</td><td style="padding:5px; border-bottom:1px solid #333; color:#50fa7b;">1705326225</td></tr>
                        <tr><td style="padding:5px;">exp (ExpiresAt)</td><td style="padding:5px; color:var(--danger);">1705412625 (24h later)</td></tr>
                    </table>
                </div>
            </div>
            
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-top:15px;">
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Algorithm</div>
                    <div style="font-size:0.9rem; color:#ff79c6;">HS256</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Token Size</div>
                    <div style="font-size:0.9rem; color:#8be9fd;">~320 bytes</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Expiration</div>
                    <div style="font-size:0.9rem; color:var(--warning);">24h</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid var(--success);">
                    <div style="font-size:0.6rem; color:#666;">Status</div>
                    <div style="font-size:0.9rem; color:var(--success);">SIGNED</div>
                </div>
            </div>
        `,
        progress: 60
    },
    {
        title: "7. Cookie Configuration",
        technical: `<strong>Secure Cookie Ayarları:</strong><br><br>
            JWT token güvenli bir cookie olarak ayarlanır. HttpOnly flag ile XSS saldırıları engellenir.<br><br>
            <strong>Cookie Attributes:</strong><br>
            - Name: Bearer<br>
            - HttpOnly: true (JS erişimi yok)<br>
            - SameSite: Strict (CSRF koruması)<br>
            - MaxAge: 24 hours`,
        component: `<strong>Go Handler - Set Cookie</strong><br><br>
            <div style="background:#000; padding:10px; border-radius:5px; font-family:monospace; font-size:0.6rem; color:#f8f8f2;">
                http.SetCookie(w, &http.Cookie{<br>
                &nbsp;&nbsp;Name: <span style="color:#f1fa8c;">"Bearer"</span>,<br>
                &nbsp;&nbsp;Value: tokenString,<br>
                &nbsp;&nbsp;HttpOnly: <span style="color:#bd93f9;">true</span>,<br>
                &nbsp;&nbsp;SameSite: http.SameSiteStrictMode,<br>
                &nbsp;&nbsp;MaxAge: 3600 * 24,<br>
                })
            </div>`,
        content: `
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
                <div style="background:#111; padding:15px; border-radius:8px; text-align:center; border:1px solid var(--success);">
                    <div style="font-size:0.6rem; color:#666;">HttpOnly</div>
                    <div style="font-size:1.2rem; color:var(--success); font-weight:bold;">[JS-SAFE]</div>
                    <div style="font-size:0.7rem; color:var(--success);">TRUE</div>
                    <div style="font-size:0.55rem; color:#666; margin-top:5px;">XSS Protected</div>
                </div>
                <div style="background:#111; padding:15px; border-radius:8px; text-align:center; border:1px solid var(--warning);">
                    <div style="font-size:0.6rem; color:#666;">SameSite</div>
                    <div style="font-size:1.2rem; color:var(--warning); font-weight:bold;">[CSRF]</div>
                    <div style="font-size:0.7rem; color:var(--warning);">STRICT</div>
                    <div style="font-size:0.55rem; color:#666; margin-top:5px;">CSRF Protected</div>
                </div>
                <div style="background:#111; padding:15px; border-radius:8px; text-align:center; border:1px solid var(--primary);">
                    <div style="font-size:0.6rem; color:#666;">MaxAge</div>
                    <div style="font-size:1.2rem; color:var(--primary); font-weight:bold;">[TTL]</div>
                    <div style="font-size:0.7rem; color:var(--primary);">24h</div>
                    <div style="font-size:0.55rem; color:#666; margin-top:5px;">Auto Expire</div>
                </div>
            </div>
        `,
        progress: 70
    },
    {
        title: "8. Response Headers Preparation",
        technical: `<strong>Yanıt Hazırlığı:</strong><br><br>
            Set-Cookie header yanıta eklenir. Content-Type ve diğer güvenlik header'ları ayarlanır.<br><br>
            <strong>Response Headers:</strong><br>
            - Set-Cookie: Bearer=eyJ...<br>
            - Content-Type: application/json<br>
            - X-Content-Type-Options: nosniff`,
        component: `<strong>Response Headers</strong><br><br>
            <div style="background:#000; padding:10px; border-radius:5px; font-family:monospace; font-size:0.65rem; color:#f8f8f2;">
                <span style="color:#8be9fd;">Set-Cookie:</span> Bearer=eyJhbGci...; Path=/; HttpOnly; SameSite=Strict<br>
                <span style="color:#8be9fd;">Content-Type:</span> application/json<br>
                <span style="color:#8be9fd;">X-Content-Type-Options:</span> nosniff
            </div>`,
        content: `
            <div class="packet visible" style="border: 2px solid var(--success); padding: 15px; border-radius: 10px; background: rgba(16,185,129,0.05);">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05); width:120px;"><strong>Set-Cookie</strong></td><td style="border: 1px solid #444; padding: 8px;"><span style="color:#f1fa8c;">Bearer=eyJhbGciOiJIUzI1NiIs...</span></td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05);"><strong>HttpOnly</strong></td><td style="border: 1px solid #444; padding: 8px;"><span style="color:var(--success);">true</span></td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05);"><strong>SameSite</strong></td><td style="border: 1px solid #444; padding: 8px;"><span style="color:var(--warning);">Strict</span></td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(16,185,129,0.2);"><strong>Expires</strong></td><td style="border: 1px solid #444; padding: 8px;"><span style="color:#8be9fd;">24 hours from now</span></td></tr>
                </table>
            </div>
        `,
        progress: 80
    },
    {
        title: "9. Audit Logging",
        technical: `<strong>Güvenlik Kaydı:</strong><br><br>
            Başarılı login olayı güvenlik loglarına kaydedilir. IP, timestamp ve user bilgileri tutulur.<br><br>
            <strong>Log Entry:</strong><br>
            - Event: LOGIN_SUCCESS<br>
            - User: admin<br>
            - IP: 192.168.1.10<br>
            - Timestamp: ISO8601`,
        component: `<strong>Security Log</strong><br><br>
            <div style="background:#000; padding:10px; border-radius:5px; font-family:monospace; font-size:0.6rem; color:#50fa7b;">
                [2024-01-15T14:23:45Z] LOGIN_SUCCESS<br>
                user=admin ip=192.168.1.10<br>
                session_id=sess_abc123
            </div>`,
        content: `
            <div style="background:#000; padding:15px; border-radius:8px; border:1px solid var(--success); font-family:monospace; font-size:0.7rem;">
                <div style="color:var(--success); margin-bottom:10px;">[LOG] SECURITY AUDIT LOG</div>
                <div style="color:#666;">
                    <span style="color:#8be9fd;">timestamp:</span> 2024-01-15T14:23:45.123Z<br>
                    <span style="color:#8be9fd;">event:</span> <span style="color:var(--success);">LOGIN_SUCCESS</span><br>
                    <span style="color:#8be9fd;">username:</span> <span style="color:#f1fa8c;">admin</span><br>
                    <span style="color:#8be9fd;">client_ip:</span> <span style="color:#f1fa8c;">192.168.1.10</span><br>
                    <span style="color:#8be9fd;">user_agent:</span> <span style="color:#f1fa8c;">PostmanRuntime/7.32</span><br>
                    <span style="color:#8be9fd;">token_exp:</span> <span style="color:#bd93f9;">24h</span>
                </div>
            </div>
        `,
        progress: 90
    },
    {
        title: "10. Response: 200 OK (Login Success)",
        technical: `<strong>Başarılı Giriş:</strong><br><br>
            Kullanıcıya 200 OK yanıtı ve JWT token döndürülür. Token hem response body'de hem cookie'de bulunur.<br><br>
            <strong>Response:</strong><br>
            - Status: 200 OK<br>
            - Body: { status, message, token }<br>
            - Cookie: Bearer token set`,
        component: `<strong>Final Response</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--success); margin-bottom:8px;">YAŞAM DÖNGÜSÜ ÖZETİ</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Total Time:</td><td style="padding:3px; color:#50fa7b; text-align:right;">156ms</td></tr>
                    <tr><td style="padding:3px;">Auth Time:</td><td style="padding:3px; color:#8be9fd; text-align:right;">142ms</td></tr>
                    <tr><td style="padding:3px;">Token Gen:</td><td style="padding:3px; color:#f1fa8c; text-align:right;">14ms</td></tr>
                </table>
            </div>`,
        content: `
            <div style="text-align: center; padding: 30px; background: rgba(16,185,129,0.05); border: 2px solid var(--success); border-radius: 15px;">
                <div style="font-size: 3rem; color: var(--success); font-weight: bold; margin-bottom: 15px;">200 OK</div>
                <div style="font-size: 1.2rem; color: rgba(255,255,255,0.8); margin-bottom: 20px;">[ AUTHENTICATION SUCCESSFUL ]</div>
                
                <div style="background:#000; padding:15px; border-radius:8px; text-align:left; font-family:monospace; font-size:0.75rem; margin-bottom:20px;">
                    {<br>
                    &nbsp;&nbsp;<span style="color:#50fa7b;">"status"</span>: <span style="color:#f1fa8c;">"success"</span>,<br>
                    &nbsp;&nbsp;<span style="color:#50fa7b;">"message"</span>: <span style="color:#f1fa8c;">"Login successful"</span>,<br>
                    &nbsp;&nbsp;<span style="color:#50fa7b;">"token"</span>: <span style="color:#f1fa8c;">"eyJhbGciOiJIUzI1NiIs..."</span><br>
                    }
                </div>
                
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px;">
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Total Time</div>
                        <div style="font-size:1rem; color:var(--primary);">156ms</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Token Type</div>
                        <div style="font-size:0.9rem; color:#bd93f9;">JWT</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Expires</div>
                        <div style="font-size:1rem; color:var(--warning);">24h</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Cookie Set</div>
                        <div style="font-size:1rem; color:var(--success);">[SET]</div>
                    </div>
                </div>
            </div>
        `,
        progress: 100
    }
];

// ============================================================================
// LOGOUT METODU - SÜPER FORM (10 AŞAMA)
// Cookie Invalidation, Session Termination
// ============================================================================

const logoutStages = [
    {
        title: "1. LOGOUT İsteği: Oturum Sonlandırma",
        technical: `<strong>RFC 6749 OAuth 2.0 - Token Revocation</strong><br><br>
            <strong>Amaç:</strong> Kullanıcı oturumunu sonlandırır. JWT token'ı içeren cookie geçersiz kılınır ve tarayıcıdan silinir.<br><br>
            <strong>Logout Strategy:</strong><br>
            - <strong>Cookie Clear:</strong> MaxAge = -1<br>
            - <strong>Value:</strong> Empty string<br>
            - <strong>Expires:</strong> Unix(0, 0) = 1970-01-01<br><br>
            <strong>Proje Endpoint:</strong><br>
            <code>router.HandleFunc("/api/v1/users/logout", handlers.LogoutHandler).Methods("POST")</code>`,
        component: `<strong>HTTP İstemci (Request Headers)</strong><br><br>
            <div style="background:#000; padding:15px; border-radius:8px; border:1px solid #333; font-family:'Fira Code', monospace; font-size:0.75rem; line-height:1.6;">
                <span style="color:var(--danger);">POST</span> /api/v1/users/logout HTTP/1.1<br>
                <span style="color:#8be9fd;">Host:</span> localhost:3000<br>
                <span style="color:#8be9fd;">Cookie:</span> Bearer=eyJhbGciOiJIUzI1NiIs...<br>
                <span style="color:#8be9fd;">Content-Length:</span> 0<br>
                <span style="color:#8be9fd;">X-Request-ID:</span> logout-req-550e8400-e29b-41d4<br>
                <span style="color:#8be9fd;">Connection:</span> keep-alive
            </div>
            <div style="margin-top:10px; padding:8px; background:rgba(239,68,68,0.1); border-radius:4px; font-size:0.7rem;">
                <strong>cURL Equivalent:</strong><br>
                <code style="color:#f1fa8c;">curl -X POST "http://localhost:3000/api/v1/users/logout" -b "Bearer=eyJhbGciOiJIUzI1NiIs..."</code>
            </div>`,
        content: `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 1.2rem; color: var(--danger); font-weight: bold; border: 2px solid var(--danger); padding: 15px 30px; border-radius: 8px; display: inline-block; background: rgba(239,68,68,0.05);">
                    [ DEAUTH ] İSTEMCİ -> [ LOGOUT REQUEST ] -> SUNUCU
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom:20px;">
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.7rem; color:var(--danger); margin-bottom:10px; font-weight:bold;">ACTIVE SESSION INFO</div>
                    <div style="font-size:0.75rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>User:</span><span style="color:#f1fa8c;">admin</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>Session Age:</span><span style="color:#8be9fd;">2h 15m</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>Token Exp:</span><span style="color:var(--warning);">21h 45m left</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>Cookie:</span><span style="color:var(--success);">Valid</span></div>
                    </div>
                </div>
                <div style="background:#111; padding:15px; border-radius:8px; border:1px solid #333;">
                    <div style="font-size:0.7rem; color:var(--warning); margin-bottom:10px; font-weight:bold;">TIMING BREAKDOWN</div>
                    <div style="font-size:0.75rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>DNS Lookup:</span><span style="color:#50fa7b;">0ms (cached)</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>TCP Reuse:</span><span style="color:#50fa7b;">0.1ms</span></div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>Cookie Parse:</span><span style="color:#50fa7b;">0.3ms</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>Request Sent:</span><span style="color:#50fa7b;">0.2ms</span></div>
                    </div>
                </div>
            </div>
            
            <div class="code-block">
                <span class="comment">// Proje handler: internal/api/handlers/users.go -> LogoutHandler()</span><br>
                <span class="keyword">func</span> <span class="function">LogoutHandler</span>(w http.ResponseWriter, r *http.Request) {<br>
                &nbsp;&nbsp;<span class="comment">// Clear the Bearer cookie by setting MaxAge to -1</span><br>
                &nbsp;&nbsp;http.SetCookie(w, &http.Cookie{<br>
                &nbsp;&nbsp;&nbsp;&nbsp;Name: <span class="string">"Bearer"</span>,<br>
                &nbsp;&nbsp;&nbsp;&nbsp;Value: <span class="string">""</span>,<br>
                &nbsp;&nbsp;&nbsp;&nbsp;MaxAge: -1,<br>
                &nbsp;&nbsp;&nbsp;&nbsp;Expires: time.Unix(0, 0),<br>
                &nbsp;&nbsp;&nbsp;&nbsp;HttpOnly: <span class="keyword">true</span>,<br>
                &nbsp;&nbsp;&nbsp;&nbsp;SameSite: http.SameSiteStrictMode,<br>
                &nbsp;&nbsp;})<br>
                &nbsp;&nbsp;...<br>
                }
            </div>
            
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-top:15px;">
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Method</div>
                    <div style="font-size:1rem; color:var(--danger);">POST</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Body Size</div>
                    <div style="font-size:1rem; color:#8be9fd;">0 bytes</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid #333;">
                    <div style="font-size:0.6rem; color:#666;">Cookie</div>
                    <div style="font-size:0.8rem; color:var(--warning);">Bearer</div>
                </div>
                <div style="background:#111; padding:10px; border-radius:5px; text-align:center; border:1px solid var(--danger);">
                    <div style="font-size:0.6rem; color:#666;">Action</div>
                    <div style="font-size:0.8rem; color:var(--danger);">CLEAR</div>
                </div>
            </div>
        `,
        progress: 10
    },
    {
        title: "2. Cookie Extraction",
        technical: `<strong>Mevcut Cookie Okunuyor:</strong><br><br>
            Request'ten Bearer cookie'si çıkarılır. Cookie varsa işlem devam eder.<br><br>
            <strong>Cookie Bilgileri:</strong><br>
            - Name: Bearer<br>
            - Value: JWT Token<br>
            - Status: Will be invalidated`,
        component: `<strong>Go Handler - Read Cookie</strong><br><br>
            <div style="background:#000; padding:10px; border-radius:5px; font-family:monospace; font-size:0.65rem; color:#f8f8f2;">
                cookie, err := r.Cookie(<span style="color:#f1fa8c;">"Bearer"</span>)<br>
                <span style="color:#6272a4;">// Cookie value will be cleared</span>
            </div>`,
        content: `
            <div style="text-align: center; margin: 20px 0;">
                <div style="padding: 20px; border: 2px solid var(--warning); border-radius: 10px; background: rgba(245,158,11,0.05); display: inline-block;">
                    <div style="font-size:0.7rem; color:var(--warning); margin-bottom:10px;">CURRENT COOKIE</div>
                    <div style="font-family:monospace; font-size:0.6rem; color:#f1fa8c; word-break:break-all;">
                        Bearer=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                    </div>
                    <div style="margin-top:10px; font-size:0.7rem; color:var(--danger);">⚠️ WILL BE INVALIDATED</div>
                </div>
            </div>
        `,
        progress: 20
    },
    {
        title: "3. Cookie Invalidation",
        technical: `<strong>Cookie Geçersiz Kılma:</strong><br><br>
            Cookie değeri boşaltılır ve MaxAge -1 olarak ayarlanır. Bu, tarayıcıya cookie'yi silmesini söyler.<br><br>
            <strong>Invalidation Strategy:</strong><br>
            - Value: "" (empty)<br>
            - MaxAge: -1 (delete immediately)<br>
            - Expires: Unix(0, 0)`,
        component: `<strong>Go Handler - Clear Cookie</strong><br><br>
            <div style="background:#000; padding:10px; border-radius:5px; font-family:monospace; font-size:0.6rem; color:#f8f8f2;">
                http.SetCookie(w, &http.Cookie{<br>
                &nbsp;&nbsp;Name: <span style="color:#f1fa8c;">"Bearer"</span>,<br>
                &nbsp;&nbsp;Value: <span style="color:#f1fa8c;">""</span>,<br>
                &nbsp;&nbsp;MaxAge: <span style="color:#bd93f9;">-1</span>,<br>
                &nbsp;&nbsp;Expires: time.Unix(0, 0),<br>
                })
            </div>`,
        content: `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                <div style="background:#111; padding:20px; border-radius:10px; border:2px solid var(--success);">
                    <div style="text-align:center; margin-bottom:15px;">
                        <div style="font-size:0.7rem; color:#666;">BEFORE</div>
                        <div style="font-size:1.5rem; color:var(--success); font-weight:bold;">[VALID]</div>
                        <div style="font-size:0.7rem; color:var(--success);">Valid Cookie</div>
                    </div>
                    <div style="font-size:0.6rem; color:#666;">
                        Value: eyJhbGci...<br>
                        MaxAge: 86400<br>
                        Expires: Tomorrow
                    </div>
                </div>
                <div style="background:#111; padding:20px; border-radius:10px; border:2px solid var(--danger);">
                    <div style="text-align:center; margin-bottom:15px;">
                        <div style="font-size:0.7rem; color:#666;">AFTER</div>
                        <div style="font-size:1.5rem; color:var(--danger); font-weight:bold;">[CLEARED]</div>
                        <div style="font-size:0.7rem; color:var(--danger);">Cookie Cleared</div>
                    </div>
                    <div style="font-size:0.6rem; color:#666;">
                        Value: ""<br>
                        MaxAge: -1<br>
                        Expires: 1970-01-01
                    </div>
                </div>
            </div>
        `,
        progress: 30
    },
    {
        title: "4. SameSite Protection Maintained",
        technical: `<strong>Güvenlik Korunuyor:</strong><br><br>
            Cookie silinse bile SameSite=Strict korunur. Bu, CSRF saldırılarına karşı korumayı sürdürür.<br><br>
            <strong>Security Flags:</strong><br>
            - SameSite: Strict<br>
            - HttpOnly: true<br>
            - Secure: false (dev)`,
        component: `<strong>Security Attributes</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">SameSite:</td><td style="padding:3px; color:var(--warning);">Strict</td></tr>
                    <tr><td style="padding:3px;">HttpOnly:</td><td style="padding:3px; color:var(--success);">true</td></tr>
                    <tr><td style="padding:3px;">Path:</td><td style="padding:3px; color:#8be9fd;">/</td></tr>
                </table>
            </div>`,
        content: `
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
                <div style="background:#111; padding:15px; border-radius:8px; text-align:center; border:1px solid var(--warning);">
                    <div style="font-size:0.6rem; color:#666;">SameSite</div>
                    <div style="font-size:1.2rem; color:var(--warning); font-weight:bold;">[CSRF]</div>
                    <div style="font-size:0.7rem; color:var(--warning);">STRICT</div>
                </div>
                <div style="background:#111; padding:15px; border-radius:8px; text-align:center; border:1px solid var(--success);">
                    <div style="font-size:0.6rem; color:#666;">HttpOnly</div>
                    <div style="font-size:1.2rem; color:var(--success); font-weight:bold;">[JS-SAFE]</div>
                    <div style="font-size:0.7rem; color:var(--success);">TRUE</div>
                </div>
                <div style="background:#111; padding:15px; border-radius:8px; text-align:center; border:1px solid var(--primary);">
                    <div style="font-size:0.6rem; color:#666;">Path</div>
                    <div style="font-size:1.2rem; color:var(--primary); font-weight:bold;">[PATH]</div>
                    <div style="font-size:0.7rem; color:var(--primary);">/</div>
                </div>
            </div>
        `,
        progress: 40
    },
    {
        title: "5. JWT Note (Server-side)",
        technical: `<strong>JWT Özelliği:</strong><br><br>
            JWT stateless olduğundan sunucu tarafında oturum yoktur. Token client-side silinir, sunucu sadece cookie'yi temizler.<br><br>
            <strong>Not:</strong><br>
            - Redis/Blacklist: Future work<br>
            - Token still valid until expiry<br>
            - Best practice: Short token lifetime`,
        component: `<strong>JWT Stateless Note</strong><br><br>
            <div style="background:#000; padding:10px; border-radius:5px; font-family:monospace; font-size:0.6rem; color:#6272a4;">
                // For JWT, logout is usually client-side<br>
                // (delete token).<br>
                // Server-side invalidation requires a<br>
                // blacklist/Redis, which is future work.
            </div>`,
        content: `
            <div style="background:rgba(245,158,11,0.1); border:1px solid var(--warning); padding:20px; border-radius:10px;">
                <div style="font-size:0.8rem; color:var(--warning); margin-bottom:15px; text-align:center;">⚠️ JWT STATELESS NATURE</div>
                <div style="font-size:0.75rem; color:#ccc; line-height:1.6;">
                    <p>JWT tokenlar stateless'tır - sunucu oturum durumu tutmaz.</p>
                    <p style="margin-top:10px;">Logout işlemi:</p>
                    <ul style="margin-left:20px; margin-top:5px;">
                        <li>Cookie silinir [OK]</li>
                        <li>Token expire olana kadar teknik olarak geçerli kalır</li>
                        <li>Redis blacklist ile tam invalidation (gelecek çalışma)</li>
                    </ul>
                </div>
            </div>
        `,
        progress: 50
    },
    {
        title: "6. Response Headers Set",
        technical: `<strong>Yanıt Header'ları:</strong><br><br>
            Set-Cookie header ile boş cookie gönderilir. Bu, tarayıcının mevcut cookie'yi silmesini sağlar.<br><br>
            <strong>Headers:</strong><br>
            - Set-Cookie: Bearer=; Max-Age=0<br>
            - Content-Type: application/json`,
        component: `<strong>Response Headers</strong><br><br>
            <div style="background:#000; padding:10px; border-radius:5px; font-family:monospace; font-size:0.65rem; color:#f8f8f2;">
                <span style="color:#8be9fd;">Set-Cookie:</span> Bearer=; Path=/; Max-Age=0; HttpOnly<br>
                <span style="color:#8be9fd;">Content-Type:</span> application/json
            </div>`,
        content: `
            <div class="packet visible" style="border: 2px solid var(--danger); padding: 15px; border-radius: 10px; background: rgba(239,68,68,0.05);">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05); width:120px;"><strong>Set-Cookie</strong></td><td style="border: 1px solid #444; padding: 8px;"><span style="color:var(--danger);">Bearer=; Max-Age=0</span></td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(255,255,255,0.05);"><strong>HttpOnly</strong></td><td style="border: 1px solid #444; padding: 8px;"><span style="color:var(--success);">true</span></td></tr>
                    <tr><td style="border: 1px solid #444; padding: 8px; background: rgba(239,68,68,0.2);"><strong>Expires</strong></td><td style="border: 1px solid #444; padding: 8px;"><span style="color:var(--danger);">1970-01-01T00:00:00Z</span></td></tr>
                </table>
            </div>
        `,
        progress: 60
    },
    {
        title: "7. JSON Response Preparation",
        technical: `<strong>Yanıt Hazırlığı:</strong><br><br>
            Success response JSON formatında hazırlanır.<br><br>
            <strong>Response Body:</strong><br>
            - status: "success"<br>
            - message: "Logged out"`,
        component: `<strong>Go Handler - Response</strong><br><br>
            <div style="background:#000; padding:10px; border-radius:5px; font-family:monospace; font-size:0.65rem; color:#f8f8f2;">
                w.Header().Set(<span style="color:#f1fa8c;">"Content-Type"</span>, <span style="color:#f1fa8c;">"application/json"</span>)<br>
                w.WriteHeader(http.StatusOK)<br>
                w.Write([]byte(<span style="color:#f1fa8c;">'{"status":"success",...}'</span>))
            </div>`,
        content: `
            <div style="background:#000; padding:15px; border-radius:8px; font-family:monospace; font-size:0.8rem; text-align:center;">
                <div style="color:var(--success); margin-bottom:10px;">RESPONSE BODY</div>
                {<br>
                &nbsp;&nbsp;<span style="color:#50fa7b;">"status"</span>: <span style="color:#f1fa8c;">"success"</span>,<br>
                &nbsp;&nbsp;<span style="color:#50fa7b;">"message"</span>: <span style="color:#f1fa8c;">"Logged out"</span><br>
                }
            </div>
        `,
        progress: 70
    },
    {
        title: "8. Audit Logging",
        technical: `<strong>Güvenlik Kaydı:</strong><br><br>
            Logout olayı güvenlik loglarına kaydedilir.<br><br>
            <strong>Log Entry:</strong><br>
            - Event: LOGOUT_SUCCESS<br>
            - User: admin<br>
            - IP: 192.168.1.10`,
        component: `<strong>Security Log</strong><br><br>
            <div style="background:#000; padding:10px; border-radius:5px; font-family:monospace; font-size:0.6rem; color:var(--danger);">
                [2024-01-15T16:38:21Z] LOGOUT_SUCCESS<br>
                user=admin ip=192.168.1.10<br>
                session_duration=2h15m
            </div>`,
        content: `
            <div style="background:#000; padding:15px; border-radius:8px; border:1px solid var(--danger); font-family:monospace; font-size:0.7rem;">
                <div style="color:var(--danger); margin-bottom:10px;">[LOG] SECURITY AUDIT LOG</div>
                <div style="color:#666;">
                    <span style="color:#8be9fd;">timestamp:</span> 2024-01-15T16:38:21.456Z<br>
                    <span style="color:#8be9fd;">event:</span> <span style="color:var(--danger);">LOGOUT_SUCCESS</span><br>
                    <span style="color:#8be9fd;">username:</span> <span style="color:#f1fa8c;">admin</span><br>
                    <span style="color:#8be9fd;">client_ip:</span> <span style="color:#f1fa8c;">192.168.1.10</span><br>
                    <span style="color:#8be9fd;">session_duration:</span> <span style="color:#bd93f9;">2h 15m</span><br>
                    <span style="color:#8be9fd;">cookie_cleared:</span> <span style="color:var(--success);">true</span>
                </div>
            </div>
        `,
        progress: 80
    },
    {
        title: "9. Client-side Cleanup",
        technical: `<strong>İstemci Tarafı Temizlik:</strong><br><br>
            Tarayıcı Set-Cookie header'ını alır ve Bearer cookie'sini siler. localStorage/sessionStorage da temizlenmelidir.<br><br>
            <strong>Client Actions:</strong><br>
            - Cookie deleted by browser<br>
            - localStorage.clear()<br>
            - Redirect to login`,
        component: `<strong>Browser Actions</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Cookie:</td><td style="padding:3px; color:var(--danger);">DELETED</td></tr>
                    <tr><td style="padding:3px;">LocalStorage:</td><td style="padding:3px; color:var(--warning);">CLEARED</td></tr>
                    <tr><td style="padding:3px;">Redirect:</td><td style="padding:3px; color:#8be9fd;">/login</td></tr>
                </table>
            </div>`,
        content: `
            <div style="padding: 20px; text-align: center;">
                <div style="font-size:0.7rem; color:#666; margin-bottom:15px;">CLIENT CLEANUP FLOW</div>
                
                <div style="border: 2px solid var(--danger); padding: 15px; border-radius: 10px; margin-bottom: 10px; background: rgba(239,68,68,0.05);">
                    <span style="color:var(--danger); font-size:0.9rem;">1. Cookie Deleted [CLEARED]</span>
                </div>
                <div style="font-size:1.5rem; color:#666;">↓</div>
                <div style="border: 2px solid var(--warning); padding: 15px; border-radius: 10px; margin-bottom: 10px; background: rgba(245,158,11,0.05);">
                    <span style="color:var(--warning); font-size:0.9rem;">2. localStorage Cleared [REMOVED]</span>
                </div>
                <div style="font-size:1.5rem; color:#666;">↓</div>
                <div style="border: 2px solid var(--primary); padding: 15px; border-radius: 10px; background: rgba(0,173,216,0.05);">
                    <span style="color:var(--primary); font-size:0.9rem;">3. Redirect to /login →</span>
                </div>
            </div>
        `,
        progress: 90
    },
    {
        title: "10. Response: 200 OK (Logout Success)",
        technical: `<strong>Başarılı Çıkış:</strong><br><br>
            Kullanıcıya 200 OK yanıtı döndürülür. Oturum başarıyla sonlandırıldı.<br><br>
            <strong>Response:</strong><br>
            - Status: 200 OK<br>
            - Cookie: Cleared<br>
            - Session: Terminated`,
        component: `<strong>Final Response</strong><br><br>
            <div style="background:#111; padding:10px; border-radius:5px; font-size:0.7rem;">
                <div style="color:var(--danger); margin-bottom:8px;">YAŞAM DÖNGÜSÜ ÖZETİ</div>
                <table style="width:100%; font-size:0.65rem;">
                    <tr><td style="padding:3px;">Total Time:</td><td style="padding:3px; color:#50fa7b; text-align:right;">8ms</td></tr>
                    <tr><td style="padding:3px;">Cookie Clear:</td><td style="padding:3px; color:#8be9fd; text-align:right;">< 1ms</td></tr>
                    <tr><td style="padding:3px;">Session:</td><td style="padding:3px; color:var(--danger); text-align:right;">TERMINATED</td></tr>
                </table>
            </div>`,
        content: `
            <div style="text-align: center; padding: 30px; background: rgba(239,68,68,0.05); border: 2px solid var(--danger); border-radius: 15px;">
                <div style="font-size: 3rem; color: var(--success); font-weight: bold; margin-bottom: 15px;">200 OK</div>
                <div style="font-size: 1.2rem; color: rgba(255,255,255,0.8); margin-bottom: 20px;">[ SESSION TERMINATED ]</div>
                
                <div style="background:#000; padding:15px; border-radius:8px; text-align:left; font-family:monospace; font-size:0.75rem; margin-bottom:20px;">
                    {<br>
                    &nbsp;&nbsp;<span style="color:#50fa7b;">"status"</span>: <span style="color:#f1fa8c;">"success"</span>,<br>
                    &nbsp;&nbsp;<span style="color:#50fa7b;">"message"</span>: <span style="color:#f1fa8c;">"Logged out"</span><br>
                    }
                </div>
                
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px;">
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Total Time</div>
                        <div style="font-size:1rem; color:var(--primary);">8ms</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Cookie</div>
                        <div style="font-size:0.9rem; color:var(--danger);">CLEARED</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Session</div>
                        <div style="font-size:0.9rem; color:var(--danger);">ENDED</div>
                    </div>
                    <div style="background:#111; padding:10px; border-radius:5px; border:1px solid #333;">
                        <div style="font-size:0.6rem; color:#666;">Status</div>
                        <div style="font-size:1rem; color:var(--success);">[OK]</div>
                    </div>
                </div>
            </div>
        `,
        progress: 100
    }
];

const allStages = {
    GET: getStages,
    POST: postStages,
    PUT: putStages,
    PATCH: patchStages,
    DELETE: deleteStages,
    LOGIN: loginStages,
    LOGOUT: logoutStages
};

window.allStages = allStages;
// Kod örnekleri (Proje mimarisiyle daha uyumlu ve geniş)
window.codeSnippets = {
    GET: {
        0: {
            go: '// handlers/devices.go\ndevices, err := repo.GetAll(filters, sorts)',
            python: 'resp = requests.get("https://localhost:3000/api/v1/devices")',
            node: 'const { data } = await axios.get("/api/v1/devices");'
        },
        7: {
            go: '// Repository Query\nerr := db.Select(&devices, "SELECT * FROM devices WHERE...")',
            python: 'db.execute("SELECT * FROM devices")',
            node: 'const query = "SELECT * FROM devices";'
        }
    },
    POST: {
        3: {
            go: '// handlers/devices.go\nerr := json.NewDecoder(r.Body).Decode(&device)',
            python: 'data = r.json()',
            node: 'const device = req.body;'
        }
    }
};
