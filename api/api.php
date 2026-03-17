<?php
// Secure Backend for Google Sheets Integration
header('Content-Type: application/json');

// 1. Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
    exit;
}

// 2. Collect and Sanitize Data
$date = $_POST['DATE'] ?? date('Y-m-d H:i:s');
$rawName = $_POST['NAME'] ?? $_POST['name'] ?? '';
$rawPhone = $_POST['PHONENO'] ?? $_POST['phone'] ?? '';
$rawAddress = $_POST['ADDRESS'] ?? $_POST['address'] ?? $_POST['LOCATION'] ?? $_POST['location'] ?? '';

// Capture user metadata automatically
$ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
$browser = $_POST['BROWSER'] ?? 'UNKNOWN';
$platform = $_POST['PLATFORM'] ?? 'UNKNOWN';
$screenResolution = $_POST['SCREEN_RESOLUTION'] ?? 'UNKNOWN';
$language = $_POST['LANGUAGE'] ?? 'UNKNOWN';
$timezone = $_POST['TIMEZONE'] ?? 'UNKNOWN';
$referrer = $_POST['REFERRER'] ?? 'UNKNOWN';

// Sanitize inputs
$name = htmlspecialchars(strip_tags(trim($rawName)), ENT_QUOTES, 'UTF-8');
$phone = preg_replace('/[^0-9]/', '', $rawPhone);
$address = htmlspecialchars(strip_tags(trim($rawAddress)), ENT_QUOTES, 'UTF-8');

// 3. Validation
if (empty($name) || strlen($phone) !== 10) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid data: Name is required and Phone must be 10 digits.']);
    exit;
}

// 4. Google Apps Script Web App URL
$googleScriptUrl = 'https://script.google.com/macros/s/AKfycbxEtRqPtzkmxDLYMz_nt2EQdxuq4NwK038ime2eTPjx-wDAarMjeC0j5e2Zjc47x3D8/exec';

if ($googleScriptUrl === 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE' || empty($googleScriptUrl)) {
    echo json_encode(['status' => 'error', 'message' => 'Backend Error: Google Script URL is not set in api.php.']);
    exit;
}

// 5. Forward data to Google Sheets via cURL
$data = [
    'DATE' => $date,
    'NAME' => $name,
    'PHONENO' => $phone,
    'ADDRESS' => $address,
    'IP_ADDRESS' => $ipAddress,
    'BROWSER' => $browser,
    'PLATFORM' => $platform,
    'SCREEN_RESOLUTION' => $screenResolution,
    'LANGUAGE' => $language,
    'TIMEZONE' => $timezone,
    'REFERRER' => $referrer
];

$ch = curl_init($googleScriptUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
curl_setopt($ch, CURLOPT_TIMEOUT, 20);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// 6. Return response to frontend
if ($error) {
    echo json_encode(['status' => 'error', 'message' => 'Connection Error: ' . $error]);
} else if ($httpCode >= 400) {
    echo json_encode(['status' => 'error', 'message' => 'Google Sheets API Error (HTTP ' . $httpCode . ')']);
} else {
    // If response is empty or not JSON, check it
    if (empty($response)) {
        echo json_encode(['status' => 'error', 'message' => 'Empty response from Google Sheets. Check your Apps Script deployment.']);
    } else {
        // Pass through the response (should be JSON from Apps Script)
        echo $response;
    }
}
?>
