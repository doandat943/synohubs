import 'dart:io';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';

/// Custom CacheManager that accepts self-signed certificates from NAS.
///
/// By default, [CachedNetworkImage] uses [DefaultCacheManager] which creates
/// its own HttpClient that does NOT respect [HttpOverrides.global].
/// This causes CERTIFICATE_VERIFY_FAILED errors when loading thumbnails
/// from NAS devices using self-signed HTTPS certificates.
///
/// This manager overrides the HttpClient to accept all bad certificates
/// for NAS thumbnail requests.
class NasCacheManager {
  static const key = 'nasImageCache';

  static CacheManager? _instance;

  static CacheManager get instance {
    _instance ??= CacheManager(
      Config(
        key,
        stalePeriod: const Duration(days: 7),
        maxNrOfCacheObjects: 500,
        fileService: HttpFileService(
          httpClient: _NasCertHttpClient(),
        ),
      ),
    );
    return _instance!;
  }

  /// Clear the NAS image cache
  static Future<void> clear() async {
    await _instance?.emptyCache();
  }
}

/// Custom HttpClient wrapper that accepts self-signed certificates.
class _NasCertHttpClient extends FileServiceHttpClient {
  _NasCertHttpClient() : super(_createClient());

  static HttpClient _createClient() {
    final client = HttpClient()
      ..connectionTimeout = const Duration(seconds: 10)
      ..badCertificateCallback = (cert, host, port) => true;
    return client;
  }
}

/// Custom HttpFileService that uses our NAS-aware HttpClient.
class HttpFileService extends FileService {
  final FileServiceHttpClient _client;

  HttpFileService({required FileServiceHttpClient httpClient})
      : _client = httpClient;

  @override
  Future<FileServiceResponse> get(String url,
      {Map<String, String>? headers}) async {
    final uri = Uri.parse(url);
    final httpResponse = await _client.send(uri, headers: headers);
    return HttpGetResponse(httpResponse);
  }
}

/// Thin wrapper to send HTTP GET requests using dart:io HttpClient.
class FileServiceHttpClient {
  final HttpClient _httpClient;

  FileServiceHttpClient(this._httpClient);

  Future<HttpClientResponse> send(Uri uri,
      {Map<String, String>? headers}) async {
    final request = await _httpClient.getUrl(uri);
    if (headers != null) {
      headers.forEach((key, value) {
        request.headers.set(key, value);
      });
    }
    return request.close();
  }
}

/// Adapter to convert HttpClientResponse into FileServiceResponse.
class HttpGetResponse extends FileServiceResponse {
  final HttpClientResponse _response;
  final DateTime _validTill;

  HttpGetResponse(this._response)
      : _validTill = DateTime.now().add(const Duration(days: 7));

  @override
  int get statusCode => _response.statusCode;

  @override
  Stream<List<int>> get content => _response;

  @override
  int? get contentLength => _response.contentLength;

  @override
  DateTime get validTill => _validTill;

  @override
  String? get eTag => _response.headers.value(HttpHeaders.etagHeader);

  @override
  String get fileExtension {
    final contentType = _response.headers.contentType;
    if (contentType != null) {
      final subType = contentType.subType;
      if (subType == 'jpeg' || subType == 'jpg') return '.jpg';
      if (subType == 'png') return '.png';
      if (subType == 'webp') return '.webp';
      if (subType == 'gif') return '.gif';
    }
    return '.jpg'; // Default for NAS thumbnails
  }
}
