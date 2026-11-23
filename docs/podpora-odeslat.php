<?php
/* Formulář Podpora (podpora.html) → e-mail na podpora@faqrai.cz (hosting Zoner, PHP mail()).
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

function odpoved(int $kod, array $data): void { http_response_code($kod); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }

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

$ok = @mail(KOMU, $predmetMime, $telo, $hlavicky, '-f' . OD);
if (!$ok) $ok = @mail(KOMU, $predmetMime, $telo, $hlavicky); // hosting může zakazovat parametr -f
if (!$ok) odpoved(502, ['chyba' => 'E-mail se nepodařilo odeslat. Napište prosím přímo na ' . KOMU . '.']);
odpoved(200, ['ok' => true]);
