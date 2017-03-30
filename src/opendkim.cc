#include "opendkim.h"
#include <stdio.h>

namespace opendkim {

using namespace std;
using namespace v8;
using namespace Nan;

// constructor
OpenDKIM::OpenDKIM() {
  dkim = NULL;
  dkim_lib = dkim_init(NULL, NULL);

  // Throw a memory exception
  if (dkim_lib == NULL) {
    Nan::ThrowError(
      Nan::New("memory allocation failure").ToLocalChecked()
    );
  }
}

// destructor
OpenDKIM::~OpenDKIM() {
  if (dkim != NULL) {
    dkim_free(dkim);
    dkim = NULL;
  }
  if (dkim_lib != NULL) {
    dkim_close(dkim_lib);
    dkim_lib = NULL;
  }
}

NAN_MODULE_INIT(OpenDKIM::Init) {
  v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
  tpl->SetClassName(Nan::New("OpenDKIM").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Administration methods
  SetPrototypeMethod(tpl, "flush_cache", FlushCache);

  // Processing methods
  SetPrototypeMethod(tpl, "header", Header);
  SetPrototypeMethod(tpl, "eoh", EOH);
  SetPrototypeMethod(tpl, "body", Body);
  SetPrototypeMethod(tpl, "eom", EOM);
  SetPrototypeMethod(tpl, "chunk", Chunk);
  SetPrototypeMethod(tpl, "chunk_end", ChunkEnd);

  // Signing methods
  SetPrototypeMethod(tpl, "sign", Sign);

  // Verifying methods
  SetPrototypeMethod(tpl, "verify", Verify);

  constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
  Nan::Set(
    target,
    Nan::New("OpenDKIM").ToLocalChecked(),
    Nan::GetFunction(tpl).ToLocalChecked()
  );
}

NAN_METHOD(OpenDKIM::New) {
  if (info.IsConstructCall()) {
    OpenDKIM *obj = new OpenDKIM();
    obj->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
  } else {
    v8::Local<v8::Function> cons = Nan::New(constructor());
    info.GetReturnValue().Set(cons->NewInstance());
  }
}

NAN_METHOD(OpenDKIM::FlushCache) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());

  v8::Local<v8::Integer> retval = Nan::New(dkim_flush_cache(obj->dkim_lib));

  info.GetReturnValue().Set(retval);
}

NAN_METHOD(OpenDKIM::Header) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  DKIM_STAT statp = DKIM_STAT_OK;

  // TODO(godsflaw): clean this up, it's getting copy/pasta all the time
  if (info.Length() != 1) {
    Nan::ThrowTypeError("header(): Wrong number of arguments");
    return;
  }

  if (!info[0]->IsObject()) {
    Nan::ThrowTypeError("header(): Argument should be an object");
    return;
  }

  char *header = NULL;
  if (!_value_to_char(info[0], "header", &header)) {
    Nan::ThrowTypeError("header(): header is undefined");
    return;
  }

  // length
  int length = 0;
  length = _value_to_int(info[0], "length");
  if (length == 0) {
    Nan::ThrowTypeError("header(): length must be defined and non-zero");
    return;
  }

  if (obj->dkim == NULL) {
    Nan::ThrowTypeError("header(): sign() or verify() must be called first");
    return;
  }

  statp = dkim_header(obj->dkim, (unsigned char *)header, length);

  _safe_free(&header);

  // Test for error and throw an exception back to js.
  if (statp != DKIM_STAT_OK) {
    throw_error(statp);
    return;
  }

  // success
  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(OpenDKIM::EOH) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  DKIM_STAT statp = DKIM_STAT_OK;

  if (obj->dkim == NULL) {
    Nan::ThrowTypeError(
      "eoh(): sign() or verify(), then header() must be called first"
    );
    return;
  }

  statp = dkim_eoh(obj->dkim);

  // Test for error and throw an exception back to js.
  if (statp != DKIM_STAT_OK && statp != DKIM_STAT_NOSIG) {
    throw_error(statp);
    return;
  }

  // success
  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(OpenDKIM::Body) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  DKIM_STAT statp = DKIM_STAT_OK;

  // TODO(godsflaw): clean this up, it's getting copy/pasta all the time
  if (info.Length() != 1) {
    Nan::ThrowTypeError("body(): Wrong number of arguments");
    return;
  }

  if (!info[0]->IsObject()) {
    Nan::ThrowTypeError("body(): Argument should be an object");
    return;
  }

  char *body = NULL;
  if (!_value_to_char(info[0], "body", &body)) {
    Nan::ThrowTypeError("body(): body is undefined");
    return;
  }

  // length
  int length = 0;
  length = _value_to_int(info[0], "length");
  if (length == 0) {
    Nan::ThrowTypeError("body(): length must be defined and non-zero");
    return;
  }

  if (obj->dkim == NULL) {
    Nan::ThrowTypeError("body(): sign() or verify() must be called first");
    return;
  }

  statp = dkim_body(obj->dkim, (unsigned char *)body, length);

  _safe_free(&body);

  // Test for error and throw an exception back to js.
  if (statp != DKIM_STAT_OK) {
    throw_error(statp);
    return;
  }

  // success
  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(OpenDKIM::EOM) {
  // TODO(godsflaw): perhaps expose this in node.js
  bool testkey = false;
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  DKIM_STAT statp = DKIM_STAT_OK;

  if (obj->dkim == NULL) {
    Nan::ThrowTypeError(
      "eom(): sign() or verify(), then body() must be called first"
    );
    return;
  }

  statp = dkim_eom(obj->dkim, &testkey);

  // Test for error and throw an exception back to js.
  if (statp != DKIM_STAT_OK && statp != DKIM_STAT_NOSIG) {
    throw_error(statp);
    return;
  }

  // success
  info.GetReturnValue().Set(Nan::New<v8::Boolean>((testkey ? true : false)));
}

NAN_METHOD(OpenDKIM::Chunk) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  DKIM_STAT statp = DKIM_STAT_OK;

  // TODO(godsflaw): clean this up, it's getting copy/pasta all the time
  if (info.Length() != 1) {
    Nan::ThrowTypeError("chunk(): Wrong number of arguments");
    return;
  }

  if (!info[0]->IsObject()) {
    Nan::ThrowTypeError("chunk(): Argument should be an object");
    return;
  }

  char *message = NULL;
  if (!_value_to_char(info[0], "message", &message)) {
    Nan::ThrowTypeError("chunk(): message is undefined");
    return;
  }

  // length
  int length = 0;
  length = _value_to_int(info[0], "length");
  if (length == 0) {
    Nan::ThrowTypeError("chunk(): length must be defined and non-zero");
    return;
  }

  if (obj->dkim == NULL) {
    Nan::ThrowTypeError("chunk(): sign() or verify() must be called first");
    return;
  }

  statp = dkim_chunk(obj->dkim, (unsigned char *)message, length);

  _safe_free(&message);

  // Test for error and throw an exception back to js.
  if (statp != DKIM_STAT_OK) {
    throw_error(statp);
    return;
  }

  // success
  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(OpenDKIM::ChunkEnd) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  DKIM_STAT statp = DKIM_STAT_OK;

  if (obj->dkim == NULL) {
    Nan::ThrowTypeError("chunk_end(): sign() or verify(), then chunk() must be called first");
    return;
  }

  // When done with calling chunk(), we need to call it with NULL pointer and 0 length.
  statp = dkim_chunk(obj->dkim, NULL, 0);

  // Test for error and throw an exception back to js.
  if (statp != DKIM_STAT_OK) {
    throw_error(statp);
    return;
  }

  // We also need to call dkim_eom(), so we can just call that method.
  obj->EOM(info);
}

NAN_METHOD(OpenDKIM::Sign) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  DKIM_STAT statp = DKIM_STAT_OK;

  // TODO(godsflaw): clean this up, it's getting copy/pasta all the time
  if (info.Length() != 1) {
    Nan::ThrowTypeError("sign(): Wrong number of arguments");
    return;
  }

  if (!info[0]->IsObject()) {
    Nan::ThrowTypeError("sign(): Argument should be an object");
    return;
  }

  // id
  char *id = NULL;
  _value_to_char(info[0], "id", &id);

  // secretkey
  char *secretkey = NULL;
  if (!_value_to_char(info[0], "secretkey", &secretkey)) {
    Nan::ThrowTypeError("sign(): secretkey is undefined");
    return;
  }

  // selector
  char *selector = NULL;
  if (!_value_to_char(info[0], "selector", &selector)) {
    Nan::ThrowTypeError("sign(): selector is undefined");
    return;
  }

  // domain
  char *domain = NULL;
  if (!_value_to_char(info[0], "domain", &domain)) {
    Nan::ThrowTypeError("sign(): domain is undefined");
    return;
  }

  // hdrcanon
  char *hdrcanon = NULL;
  if (!_value_to_char(info[0], "hdrcanon", &hdrcanon)) {
    Nan::ThrowTypeError("sign(): hdrcanon is undefined");
    return;
  }
  for (int i = 0 ; hdrcanon[i] != '\0'; i++) hdrcanon[i] = tolower(hdrcanon[i]);

  dkim_canon_t hdrcanon_alg = DKIM_CANON_SIMPLE;
  if (strcmp(hdrcanon, "relaxed") == 0) {
    hdrcanon_alg = DKIM_CANON_RELAXED;
  }

  // bodycanon
  char *bodycanon = NULL;
  if (!_value_to_char(info[0], "bodycanon", &bodycanon)) {
    Nan::ThrowTypeError("sign(): bodycanon is undefined");
    return;
  }
  for (int i = 0 ; bodycanon[i] != '\0'; i++) bodycanon[i] = tolower(bodycanon[i]);

  dkim_canon_t bodycanon_alg = DKIM_CANON_SIMPLE;
  if (strcmp(bodycanon, "relaxed") == 0) {
    bodycanon_alg = DKIM_CANON_RELAXED;
  }

  // signalg
  char *signalg = NULL;
  if (!_value_to_char(info[0], "signalg", &signalg)) {
    Nan::ThrowTypeError("sign(): signalg is undefined");
    return;
  }
  for (int i = 0 ; signalg[i] != '\0'; i++) signalg[i] = tolower(signalg[i]);

  dkim_alg_t sign_alg = DKIM_SIGN_RSASHA1;
  if (strcmp(signalg, "sha256") == 0) {
    sign_alg = DKIM_SIGN_RSASHA256;
  }

  // length
  int length = -1;
  length = _value_to_int(info[0], "length");

  // free this to clear the old context
  // TODO(godsflaw): make this its own method
  if (obj->dkim != NULL) {
    dkim_free(obj->dkim);
    obj->dkim = NULL;
  }

  obj->dkim = dkim_sign(
    obj->dkim_lib,
    (unsigned char *)id,
    NULL,                                         /* (void *memclosure) */
    (unsigned char *)secretkey,
    (unsigned char *)selector,
    (unsigned char *)domain,
    hdrcanon_alg,
    bodycanon_alg,
    sign_alg,
    length,
    &statp
  );

  _safe_free(&id);
  _safe_free(&secretkey);
  _safe_free(&selector);
  _safe_free(&domain);
  _safe_free(&hdrcanon);
  _safe_free(&bodycanon);
  _safe_free(&signalg);

  // Test for error and throw an exception back to js.
  if (obj->dkim == NULL) {
    throw_error(statp);
    return;
  }

  // success
  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(OpenDKIM::Verify) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  DKIM_STAT statp = DKIM_STAT_OK;

  if (info.Length() != 1) {
    Nan::ThrowTypeError("verify(): Wrong number of arguments");
    return;
  }

  if (!info[0]->IsObject()) {
    Nan::ThrowTypeError("verify(): Argument should be an object");
    return;
  }

  // id
  char *id = NULL;
  _value_to_char(info[0], "id", &id);

  // free this to clear the old context
  // TODO(godsflaw): make this its own method
  if (obj->dkim != NULL) {
    dkim_free(obj->dkim);
    obj->dkim = NULL;
  }

  obj->dkim = dkim_verify(obj->dkim_lib, (unsigned char *)id, NULL, &statp);

  _safe_free(&id);

  // Test for error and throw an exception back to js.
  if (obj->dkim == NULL) {
    throw_error(statp);
    return;
  }

  // success
  info.GetReturnValue().Set(info.This());
}

NODE_MODULE(opendkim, OpenDKIM::Init)

}
