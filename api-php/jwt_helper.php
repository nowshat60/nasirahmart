<?php
class JwtHelper {
    public static function encode($payload, $key, $alg = 'HS256') {
        $header = ['typ' => 'JWT', 'alg' => $alg];
        $segments = [
            self::urlsafeB64Encode(json_encode($header)),
            self::urlsafeB64Encode(json_encode($payload))
        ];
        $signing_input = implode('.', $segments);
        $signature = self::sign($signing_input, $key, $alg);
        $segments[] = self::urlsafeB64Encode($signature);
        return implode('.', $segments);
    }

    public static function decode($jwt, $key, $alg = 'HS256') {
        $tks = explode('.', $jwt);
        if (count($tks) != 3) return null;
        list($headb64, $bodyb64, $cryptob64) = $tks;
        $sig = self::urlsafeB64Decode($cryptob64);
        if (self::sign("$headb64.$bodyb64", $key, $alg) !== $sig) return null;
        return json_decode(self::urlsafeB64Decode($bodyb64));
    }

    private static function sign($msg, $key, $alg) {
        return hash_hmac('sha256', $msg, $key, true);
    }

    private static function urlsafeB64Encode($input) {
        return str_replace('=', '', strtr(base64_encode($input), '+/', '-_'));
    }

    private static function urlsafeB64Decode($input) {
        $remainder = strlen($input) % 4;
        if ($remainder) {
            $padlen = 4 - $remainder;
            $input .= str_repeat('=', $padlen);
        }
        return base64_decode(strtr($input, '-_', '+/'));
    }
}
?>
