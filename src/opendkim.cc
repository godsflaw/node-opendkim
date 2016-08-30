#include "opendkim.h"

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

NAN_METHOD(OpenDKIM::Sign) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  DKIM_STAT statp = 0;

  if (info.Length() != 1) {
    Nan::ThrowTypeError("sign(): Wrong number of arguments");
    return;
  }

  if (!info[0]->IsObject()) {
    Nan::ThrowTypeError("sign(): Argument should be an object");
    return;
  }

  // id
  char *id = _value_to_char(info[0], "id");

  // secretkey
  char *secretkey = NULL;
  if ((secretkey = _value_to_char(info[0], "secretkey")) == NULL) {
    Nan::ThrowTypeError("sign(): secretkey is undefined");
    return;
  }

  // selector
  char *selector = NULL;
  if ((selector = _value_to_char(info[0], "selector")) == NULL) {
    Nan::ThrowTypeError("sign(): selector is undefined");
    return;
  }

  // domain
  char *domain = NULL;
  if ((domain = _value_to_char(info[0], "domain")) == NULL) {
    Nan::ThrowTypeError("sign(): domain is undefined");
    return;
  }

  // hdrcanon
  char *hdrcanon = NULL;
  if ((hdrcanon = _value_to_char(info[0], "hdrcanon")) == NULL) {
    Nan::ThrowTypeError("sign(): hdrcanon is undefined");
    return;
  }
  for ( ; *hdrcanon; ++hdrcanon) *hdrcanon = tolower(*hdrcanon);

  dkim_canon_t hdrcanon_alg = DKIM_CANON_SIMPLE;
  if (strcmp(hdrcanon, "relaxed") == 0) {
    hdrcanon_alg = DKIM_CANON_RELAXED;
  }

  // bodycanon
  char *bodycanon = NULL;
  if ((bodycanon = _value_to_char(info[0], "bodycanon")) == NULL) {
    Nan::ThrowTypeError("sign(): bodycanon is undefined");
    return;
  }
  for ( ; *bodycanon; ++bodycanon) *bodycanon = tolower(*bodycanon);

  dkim_canon_t bodycanon_alg = DKIM_CANON_SIMPLE;
  if (strcmp(bodycanon, "relaxed") == 0) {
    bodycanon_alg = DKIM_CANON_RELAXED;
  }

  // signalg
  char *signalg = NULL;
  if ((signalg = _value_to_char(info[0], "signalg")) == NULL) {
    Nan::ThrowTypeError("sign(): signalg is undefined");
    return;
  }
  for ( ; *signalg; ++signalg) *signalg = tolower(*signalg);

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
  DKIM_STAT statp = 0;

  if (info.Length() != 1) {
    Nan::ThrowTypeError("verify(): Wrong number of arguments");
    return;
  }

  if (!info[0]->IsObject()) {
    Nan::ThrowTypeError("verify(): Argument should be an object");
    return;
  }

  // id
  char *id = _value_to_char(info[0], "id");

  // free this to clear the old context
  // TODO(godsflaw): make this its own method
  if (obj->dkim != NULL) {
    dkim_free(obj->dkim);
    obj->dkim = NULL;
  }

  obj->dkim = dkim_verify(obj->dkim_lib, (unsigned char *)id, NULL, &statp);

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
