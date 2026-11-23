<?php
/* Formulář Podpora (podpora.html) → e-mail na podpora@faqrai.cz přes SMTP schránky (Zoner: smtp.zoner.com:587).
   Odpověď jde přímo zákazníkovi (Reply-To). Ochrana: jen POST z formuláře, past na roboty, nejvýš 10 dotazů za den z jedné adresy.
   Dotaz se zároveň ukládá do služby na Cloudflare (záloha, Správce → Dotazy z podpory) – to dělá stránka sama. */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$puvod = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($puvod, ['https://faqrai.cz', 'https://www.faqrai.cz', 'https://vitepa.github.io'], true)) { header('Access-Control-Allow-Origin: ' . $puvod); header('Vary: Origin'); header('Access-Control-Allow-Methods: POST, OPTIONS'); header('Access-Control-Allow-Headers: Content-Type, Accept'); }
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }

const KOMU = 'podpora@faqrai.cz';
const OD = 'podpora@faqrai.cz';
const DENNI_LIMIT = 10;

/* odeslání přes SMTP schránky podpora@faqrai.cz; údaje v podpora-smtp.php (vytvoří ho nahrávání webu z GitHub secretů, v gitu není) */
function smtpNastaveni(): ?array {
  foreach ([__DIR__ . '/podpora-smtp.php', __DIR__ . '/../podpora-smtp.php'] as $f) if (is_file($f)) { $c = include $f; if (is_array($c) && !empty($c['heslo'])) return $c + ['server' => 'smtp.zoner.com', 'port' => 587, 'uzivatel' => OD]; } // Zoner: smtp.zoner.com:587 STARTTLS
  return null;
}
function smtpOdesli(string $predmet, string $telo, string $hlavicky, ?string &$chyba = null): bool {
  $c = smtpNastaveni(); if (!$c) { $chyba = 'SMTP není nastavené'; return false; }
  $port = (int)($c['port'] ?? 587); $uziv = $c['uzivatel'] ?? OD;
  $sock = @stream_socket_client(($port === 465 ? 'ssl://' : 'tcp://') . $c['server'] . ':' . $port, $en, $es, 20, STREAM_CLIENT_CONNECT, stream_context_create(['ssl' => ($c['tlsOverit'] ?? true) ? ['peer_name' => $c['server']] : ['verify_peer' => false, 'verify_peer_name' => false]]));
  if (!$sock) { $chyba = "spojení: $es"; return false; }
  stream_set_timeout($sock, 20);
  $cti = function () use ($sock): string { $r = ''; while (($l = fgets($sock, 1024)) !== false) { $r .= $l; if (strlen($l) < 4 || $l[3] === ' ') break; } return $r; };
  $prikaz = function (string $p, array $ok) use ($sock, $cti): string { if ($p !== '') fwrite($sock, $p . "\r\n"); $r = $cti(); if (!in_array((int)substr($r, 0, 3), $ok, true)) throw new RuntimeException(trim($r)); return $r; };
  try {
    $prikaz('', [220]); $host = 'faqrai.cz';
    $prikaz("EHLO $host", [250]);
    if ($port !== 465) { $prikaz('STARTTLS', [220]); if (!stream_socket_enable_crypto($sock, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) throw new RuntimeException('STARTTLS selhal'); $prikaz("EHLO $host", [250]); }
    $prikaz('AUTH LOGIN', [334]); $prikaz(base64_encode($uziv), [334]); $prikaz(base64_encode($c['heslo']), [235]);
    $prikaz('MAIL FROM:<' . OD . '>', [250]); $prikaz('RCPT TO:<' . KOMU . '>', [250, 251]); $prikaz('DATA', [354]);
    $zprava = "To: <" . KOMU . ">\r\nSubject: $predmet\r\nDate: " . date('r') . "\r\nMessage-ID: <" . bin2hex(random_bytes(12)) . "@faqrai.cz>\r\n" . $hlavicky . "\r\n\r\n" . str_replace("\n", "\r\n", str_replace("\r\n", "\n", $telo));
    $zprava = preg_replace('/^\./m', '..', $zprava);
    $prikaz($zprava . "\r\n.", [250]); $prikaz('QUIT', [221]);
    return true;
  } catch (Throwable $e) { $chyba = $e->getMessage(); return false; } finally { @fclose($sock); }
}
function odpoved(int $kod, array $data): void { http_response_code($kod); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET' && isset($_GET['diag'])) {
  // diagnostika bez citlivých údajů: běží PHP a smí odesílat e-maily?
  $zakazane = array_map('trim', explode(',', (string)ini_get('disable_functions')));
  if (isset($_GET['test'])) {
    // zkušební e-mail (nejvýš 3× denně): vrátí, jak dopadlo odeslání s parametrem -f a bez něj
    $f = rtrim(sys_get_temp_dir(), '/\\') . '/faqrai-podpora-test-' . date('Y-m-d');
    $n = is_file($f) ? (int)@file_get_contents($f) : 0; if ($n >= 3) odpoved(429, ['chyba' => 'Dnes už byly 3 zkoušky.']);
    @file_put_contents($f, (string)($n + 1));
    $smtpChyba = null; $s3 = smtpOdesli('Test formulare podpory (SMTP) ' . date('H:i:s'), "Zkusebni zprava z faqrai.cz pres SMTP.", "From: FaqrAi web <" . OD . ">\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8", $smtpChyba);
    odpoved(200, ['smtp' => $s3, 'smtpChyba' => $smtpChyba]);
  }
  odpoved(200, ['php' => PHP_VERSION, 'mail' => function_exists('mail') && !in_array('mail', $zakazane, true), 'sendmail' => (string)ini_get('sendmail_path') !== '', 'smtp' => smtpNastaveni() !== null]);
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') odpoved(405, ['chyba' => 'Jen POST.']);
$surova = file_get_contents('php://input', false, null, 0, 20000);
if ($surova === false || strlen($surova) >= 20000) odpoved(413, ['chyba' => 'Příliš dlouhá zpráva.']);
$o = json_decode($surova, true);
if (!is_array($o)) $o = $_POST;

$s = function (string $k, int $n) use ($o): string {
  $v = isset($o[$k]) && is_scalar($o[$k]) ? (string)$o[$k] : '';
  $v = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '');
  return mb_substr($v, 0, $n, 'UTF-8');
};
$jedenRadek = fn(string $v): string => trim(preg_replace('/[\r\n]+/', ' ', $v) ?? '');

if ($s('web', 10) !== '') odpoved(200, ['ok' => true]); // past na roboty
$email = $jedenRadek($s('email', 200));
$text = $s('text', 8000);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) odpoved(400, ['chyba' => 'Chybí platný e-mail.']);
if (mb_strlen($text, 'UTF-8') < 3) odpoved(400, ['chyba' => 'Chybí popis požadavku.']);

// omezení počtu dotazů z jedné adresy za den
$ip = $_SERVER['REMOTE_ADDR'] ?? '?';
$soubor = rtrim(sys_get_temp_dir(), '/\\') . '/faqrai-podpora-' . date('Y-m-d') . '-' . substr(hash('sha256', 'FQ-IP:' . $ip), 0, 24);
$pocet = is_file($soubor) ? (int)@file_get_contents($soubor) : 0;
if ($pocet >= DENNI_LIMIT) odpoved(429, ['chyba' => 'Z této adresy přišlo dnes už příliš mnoho dotazů. Napište prosím přímo na ' . KOMU . '.']);
@file_put_contents($soubor, (string)($pocet + 1));

$jmeno = $jedenRadek($s('name', 120));
$typ = $jedenRadek($s('kind', 60)) ?: 'Dotaz';
$produkt = $jedenRadek($s('product', 60));
$predmet = 'Podpora: ' . $typ . ($produkt !== '' ? ' – ' . $produkt : '') . ($jmeno !== '' ? ' (' . $jmeno . ')' : '');
$telo = "Od: " . ($jmeno !== '' ? "$jmeno <$email>" : $email) . "\n"
  . "Typ: $typ\n"
  . "Produkt: $produkt\n"
  . "Verze: " . $jedenRadek($s('version', 40)) . "\n"
  . "Systém: " . $jedenRadek($s('os', 60)) . "\n"
  . "Licence: " . $jedenRadek($s('licence', 80)) . "\n"
  . "Odesláno: " . date('j. n. Y H:i') . " z formuláře na faqrai.cz\n\n"
  . $text . "\n";

$hlavicky = implode("\r\n", [
  'From: =?UTF-8?B?' . base64_encode('FaqrAi – formulář podpory') . '?= <' . OD . '>',
  'Reply-To: ' . ($jmeno !== '' ? '=?UTF-8?B?' . base64_encode($jmeno) . '?= ' : '') . '<' . $email . '>',
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset=UTF-8',
  'Content-Transfer-Encoding: 8bit',
  'X-Mailer: FaqrAi web',
]);
$predmetMime = '=?UTF-8?B?' . base64_encode($predmet) . '?=';

$ok = smtpOdesli($predmetMime, $telo, $hlavicky); // Zoner blokuje PHP mail(), odesílá se přes SMTP schránky
if (!$ok) odpoved(502, ['chyba' => 'E-mail se nepodařilo odeslat. Napište prosím přímo na ' . KOMU . '.']);
odpoved(200, ['ok' => true]);
