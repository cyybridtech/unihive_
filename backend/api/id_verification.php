<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'config.php';

define('GOOGLE_VISION_KEY', 'AIzaSyBV0-NWIQck-eadRO-ZmucBIHyynD0Y7Rs');

$data = json_decode(file_get_contents("php://input"), true);
$image_url = $data['image_url'] ?? null;
$name = trim($data['name'] ?? '');
$declared_age = (int)($data['age'] ?? 0);
$declared_gender = $data['gender'] ?? '';

if (!$image_url || !$name || !$declared_age || !$declared_gender) {
    echo json_encode(['status' => 'error', 'message' => 'Missing image_url, name, age, or gender']);
    exit;
}

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => "https://vision.googleapis.com/v1/images:annotate?key=" . GOOGLE_VISION_KEY,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode([
        'requests' => [[
            'image' => ['source' => ['imageUri' => $image_url]],
            'features' => [['type' => 'TEXT_DETECTION', 'maxResults' => 10]]
        ]]
    ]),
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
]);

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

if ($httpCode !== 200) {
    echo json_encode(['status' => 'error', 'message' => 'Vision API failed', 'code' => $httpCode]);
    exit;
}

$vision = json_decode($response, true);
$text = '';
if (isset($vision['responses'][0]['fullTextAnnotation']['text'])) {
    $text = strtolower($vision['responses'][0]['fullTextAnnotation']['text']);
}

$extracted = extractIdInfo($text);
$match_score = calculateMatch($extracted, $name, $declared_age, $declared_gender);

echo json_encode([
    'status' => $match_score > 0.7 ? 'success' : 'warning',
    'match_score' => $match_score,
    'extracted' => $extracted,
    'raw_text' => substr($text, 0, 500) . '...'
]);

function extractIdInfo($text) {
    $info = ['name' => '', 'age' => 0, 'gender' => ''];
    
    // Name patterns
    if (preg_match('/(?:name|names?)\s*[:\-]?\s*([a-z\s]{3,30})/i', $text, $m)) {
        $info['name'] = trim($m[1]);
    }
    
    // DOB/Age
    if (preg_match('/(?:dob|date of birth|born)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i', $text, $m)) {
        $dob = DateTime::createFromFormat('d/m/Y', $m[1]);
        if ($dob) $info['age'] = (new DateTime())->diff($dob)->y;
    }
    
    // Gender
    if (preg_match('/(male|m|man|boy)/i', $text)) $info['gender'] = 'male';
    elseif (preg_match('/(female|f|woman|girl)/i', $text)) $info['gender'] = 'female';
    
    return $info;
}

function calculateMatch($extracted, $name, $age, $gender) {
    $score = 0;
    
    // Gender exact
    if (strtolower($extracted['gender']) === strtolower($gender)) $score += 0.4;
    
    // Name fuzzy (80%+)
    similar_text(strtolower($extracted['name']), strtolower($name), $pct);
    if ($pct > 80) $score += 0.4;
    
    // Age close (±2)
    if (abs($extracted['age'] - $age) <= 2) $score += 0.2;
    
    return $score;
}
?>

