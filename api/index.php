<?php

    // Не рекомендуется вносить самостоятельно изменения в скрипт, так как любые последствия неработоспособности будут лежать на вас.
    // С уважением, Cloaking.House


    // It is not recommended to make changes to this script on your own, as any consequences of malfunction will be your responsibility.
    // Sincerely, Cloaking.House



    // error_reporting(0); // Disabled to help with debugging
    
    // Include IP Blacklist utilities
    require_once(__DIR__ . '/ip_utils.php');
    $blacklist = require(__DIR__ . '/blacklist_ips.php');

    if (function_exists('mb_internal_encoding')) {
        mb_internal_encoding('UTF-8');
    }

    if (version_compare(PHP_VERSION, '7.2', '<')) {
        exit('PHP 7.2 or higher is required.');
    }

    if ( ! extension_loaded('curl')) {
        exit('The cURL PHP extension is required.');
    }

    // ... (rest of the extension checks)

    function get_real_ip_address()
    {
        $remote_addr        = ! empty($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
        $allowed_headers    = [
            'HTTP_CF_CONNECTING_IP',
            'HTTP_TRUE_CLIENT_IP',
            'HTTP_X_REAL_IP',
            'HTTP_X_FORWARDED_FOR'
        ];

        foreach ($allowed_headers AS $header) {
            if ( ! empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                foreach ($ips AS $ip) {
                    $ip = trim($ip);
                    $ip = preg_replace('/:\d+$/', '', $ip);
                    $ip = trim($ip, '[]');
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                        return trim($ip);
                    }
                }
            }
        }
        return $remote_addr;
    }

    function get_user_agent() {
        return !empty($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
    }

    function get_referer() {
        return !empty($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
    }

    function get_query_string() {
        return !empty($_SERVER['QUERY_STRING']) ? $_SERVER['QUERY_STRING'] : '';
    }

    function get_browser_language() {
        return !empty($_SERVER['HTTP_ACCEPT_LANGUAGE']) ? $_SERVER['HTTP_ACCEPT_LANGUAGE'] : '';
    }

    $client_ip = get_real_ip_address();

    // 1. LOCAL BLACKLIST CHECK (Blocked IPs always see White Page)
    if (ip_is_blacklisted($client_ip, $blacklist)) {
        $forced_white_page = __DIR__ . '/../index.html';
        if (file_exists($forced_white_page)) {
            echo file_get_contents($forced_white_page);
            exit;
        } else {
            exit('White Page Not Found (Blacklisted Body).');
        }
    }

    // 2. PROCEED TO CLOAKING.HOUSE API
    // (Existing request_data logic...)
    $request_data = [
        'label'         => '573a9c21c29e195dddddfbfbe7b02b38', 
        'user_agent'    => get_user_agent(), 
        'referer'       => get_referer(), 
        'query'         => get_query_string(), 
        'lang'          => get_browser_language(),
        'ip_address'    => $client_ip
    ];
        
    $request_data   = http_build_query($request_data);
    $success_codes  = [200, 201, 204, 206];

    $ch = curl_init('https://cloakit.house/api/v1/check');
    // ... (rest of curl settings)
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER  => TRUE,
        CURLOPT_CUSTOMREQUEST   => 'POST',
        CURLOPT_SSL_VERIFYPEER  => FALSE,
        CURLOPT_TIMEOUT         => 15,
        CURLOPT_POSTFIELDS      => $request_data
    ]);

    $result = curl_exec($ch);
    $info   = curl_getinfo($ch);
    curl_close($ch);

    if (isset($info['http_code']) && in_array($info['http_code'], $success_codes)) {
        $body = json_decode($result, TRUE);

        if ( ! empty($body['filter_type'])) {
            // ... (message logic)
            $messages = [
                'subscription_expired'  => 'Your Subscription Expired.',
                'flow_deleted'          => 'Flow Deleted.',
                'flow_banned'           => 'Flow Banned.',
            ];
            if (isset($messages[$body['filter_type']])) {
                exit($messages[$body['filter_type']]);
            }
        }

        if ( ! empty($body['url_white_page']) && ! empty($body['url_offer_page'])) {
            
            // Resolve filenames to absolute paths if they are local files
            $white_path = $body['url_white_page'];
            $offer_path = $body['url_offer_page'];

            // If the paths returned are relative (like "index.html"), prefix with parent dir
            if (!filter_var($white_path, FILTER_VALIDATE_URL) && !file_exists($white_path)) {
                $white_path = __DIR__ . '/../' . $white_path;
            }
            if (!filter_var($offer_path, FILTER_VALIDATE_URL) && !file_exists($offer_path)) {
                $offer_path = __DIR__ . '/../' . $offer_path;
            }

            // Offer Page
            if ($body['filter_page'] == 'offer') {
                if ($body['mode_offer_page'] == 'loading') {
                    if (filter_var($offer_path, FILTER_VALIDATE_URL)) {
                        echo str_replace('<head>', '<head><base href="' . $offer_path . '" />', file_get_contents($offer_path, FALSE, create_stream_context()));
                    } elseif (file_exists($offer_path)) {
                        if (pathinfo($offer_path, PATHINFO_EXTENSION) == 'html') {
                            echo file_get_contents($offer_path, FALSE, create_stream_context());
                        } else {
                            require_once($offer_path);
                        }
                    } else {
                        exit('Offer Page Not Found at: ' . $offer_path);
                    }
                }

                if ($body['mode_offer_page'] == 'redirect') {
                    header('Location: ' . $offer_path, TRUE, 302);
                    exit(0);
                }

                if ($body['mode_offer_page'] == 'iframe') {
                    echo '<iframe src="' . $offer_path . '" width="100%" height="100%" align="left"></iframe><style> body { padding: 0; margin: 0; } iframe { margin: 0; padding: 0; border: 0; }</style>';
                    exit(0);
                }
            }

            // White Page
            if ($body['filter_page'] == 'white') {
                if ($body['mode_white_page'] == 'loading') {
                    if (filter_var($white_path, FILTER_VALIDATE_URL)) {
                        echo str_replace('<head>', '<head><base href="' . $white_path . '" />', file_get_contents($white_path, FALSE, create_stream_context()));
                    } elseif (file_exists($white_path)) {
                        if (pathinfo($white_path, PATHINFO_EXTENSION) == 'html') {
                            echo file_get_contents($white_path, FALSE, create_stream_context());
                        } else {
                            require_once($white_path);
                        }
                    } else {
                        exit('White Page Not Found at: ' . $white_path);
                    }
                }

                if ($body['mode_white_page'] == 'redirect') {
                    header('Location: ' . $white_path, TRUE, 302);
                    exit(0);
                }
            }
        } else {
            exit('Offer Page or White Page Not Found in API response.');
        }
    } else {
        exit('Try again later or contact support. Status Code: ' . $info['http_code']);
    }

?>