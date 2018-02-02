#include "opendkim.h"
#include <stdio.h>
#include <unistd.h>    // TODO(godsflaw): port for windows?

#define IDENTITY_SIZE 64

namespace opendkim {

using namespace std;
using namespace v8;
using namespace Nan;

DKIM_LIB *dkim_lib = NULL;

// figure out which option this is, and return that type
int _get_option(char *option, size_t len) {
  if (strncmp(option, "DKIM_OPTS_QUERYMETHOD", len) == 0) {
    return DKIM_OPTS_QUERYMETHOD;
  } else if (strncmp(option, "DKIM_OPTS_QUERYINFO", len) == 0) {
    return DKIM_OPTS_QUERYINFO;
  } else if (strncmp(option, "DKIM_OPTS_TMPDIR", len) == 0) {
    return DKIM_OPTS_QUERYINFO;
  }

  // return -1 for error if we don't find the option
  return -1;
}

// constructor
OpenDKIM::OpenDKIM() {
  dkim = NULL;
  sig = NULL;

  if (dkim_lib == NULL) {
    if ((dkim_lib = dkim_init(NULL, NULL)) == NULL) {
      Nan::ThrowError(
        Nan::New("memory allocation failure").ToLocalChecked()
      );
    }
  }
}

// destructor
OpenDKIM::~OpenDKIM() {
  if (dkim != NULL) {
    dkim_free(dkim);
    dkim = NULL;
  }
}

NAN_MODULE_INIT(OpenDKIM::Init) {
  v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
  tpl->SetClassName(Nan::New<String>("OpenDKIM").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Administration methods
  Nan::SetPrototypeMethod(tpl, "flush_cache", FlushCache);
  Nan::SetPrototypeMethod(tpl, "lib_feature_obj", LibFeature);

  // Processing methods
  Nan::SetPrototypeMethod(tpl, "header", Header);
  Nan::SetPrototypeMethod(tpl, "eoh", EOH);
  Nan::SetPrototypeMethod(tpl, "body", Body);
  Nan::SetPrototypeMethod(tpl, "eom", EOM);
  Nan::SetPrototypeMethod(tpl, "chunk", Chunk);
  Nan::SetPrototypeMethod(tpl, "chunk_end", ChunkEnd);

  // Signing methods
  Nan::SetPrototypeMethod(tpl, "sign", Sign);

  // Verifying methods
  Nan::SetPrototypeMethod(tpl, "verify", Verify);
  Nan::SetPrototypeMethod(tpl, "get_signature", GetSignature);
  Nan::SetPrototypeMethod(tpl, "sig_getidentity", SigGetIdentity);
  Nan::SetPrototypeMethod(tpl, "sig_getdomain", SigGetDomain);
  Nan::SetPrototypeMethod(tpl, "sig_getselector", SigGetSelector);
  Nan::SetPrototypeMethod(tpl, "sig_geterror", SigGetError);
  Nan::SetPrototypeMethod(tpl, "sig_geterrorstr", SigGetErrorStr);
  Nan::SetPrototypeMethod(tpl, "sig_getcanonlen", SigGetCanonlen);

  // Utility methods
  Nan::SetPrototypeMethod(tpl, "get_option", GetOption);
  Nan::SetPrototypeMethod(tpl, "set_option", SetOption);
  Nan::SetPrototypeMethod(tpl, "ohdrs", OHDRS);

  constructor().Reset(tpl->GetFunction());
  Nan::Set(
    target,
    Nan::New("OpenDKIM").ToLocalChecked(),
    tpl->GetFunction()
  );
}

NAN_METHOD(OpenDKIM::New) {
  if (info.IsConstructCall()) {
    OpenDKIM *obj = new OpenDKIM();
    obj->Wrap(info.This());
    info.GetReturnValue().Set(info.This());
  } else {
    v8::Local<v8::Function> cons = Nan::New(constructor());
    info.GetReturnValue().Set(Nan::NewInstance(cons).ToLocalChecked());
  }
}

NAN_METHOD(OpenDKIM::FlushCache) {
  v8::Local<v8::Integer> retval = Nan::New(dkim_flush_cache(dkim_lib));
  info.GetReturnValue().Set(retval);
}

NAN_METHOD(OpenDKIM::Header) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  DKIM_STAT statp = DKIM_STAT_OK;
  char *header = NULL;
  int length = 0;

  if (info.Length() != 1) {
    Nan::ThrowTypeError("header(): Wrong number of arguments");
    goto finish_header;
  }

  if (!info[0]->IsObject()) {
    Nan::ThrowTypeError("header(): Argument should be an object");
    goto finish_header;
  }

  if (!_value_to_char(info[0], "header", &header)) {
    Nan::ThrowTypeError("header(): header is undefined");
    goto finish_header;
  }

  // length
  length = _value_to_int(info[0], "length");
  if (length == 0) {
    Nan::ThrowTypeError("header(): length must be defined and non-zero");
    goto finish_header;
  }

  if (obj->dkim == NULL) {
    Nan::ThrowTypeError("header(): sign() or verify() must be called first");
    goto finish_header;
  }

  statp = dkim_header(obj->dkim, (unsigned char *)header, length);

  // Test for error and throw an exception back to js.
  if (statp != DKIM_STAT_OK) {
    throw_error(statp);
    goto finish_header;
  }

  finish_header:
    _safe_free(&header);

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
  if (statp != DKIM_STAT_OK) {
    throw_error(statp);
    return;
  }

  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(OpenDKIM::Body) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  DKIM_STAT statp = DKIM_STAT_OK;
  char *body = NULL;
  int length = 0;

  if (info.Length() != 1) {
    Nan::ThrowTypeError("body(): Wrong number of arguments");
    goto finish_body;
  }

  if (!info[0]->IsObject()) {
    Nan::ThrowTypeError("body(): Argument should be an object");
    goto finish_body;
  }

  if (!_value_to_char(info[0], "body", &body)) {
    Nan::ThrowTypeError("body(): body is undefined");
    goto finish_body;
  }

  // length
  length = _value_to_int(info[0], "length");
  if (length == 0) {
    Nan::ThrowTypeError("body(): length must be defined and non-zero");
    goto finish_body;
  }

  if (obj->dkim == NULL) {
    Nan::ThrowTypeError("body(): sign() or verify() must be called first");
    goto finish_body;
  }

  statp = dkim_body(obj->dkim, (unsigned char *)body, length);

  // Test for error and throw an exception back to js.
  if (statp != DKIM_STAT_OK) {
    throw_error(statp);
    goto finish_body;
  }

  finish_body:
    _safe_free(&body);

  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(OpenDKIM::EOM) {
  // TODO(godsflaw): perhaps expose this in node.js
  bool testkey = false;
  bool returntest = false;
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  DKIM_STAT statp = DKIM_STAT_OK;

  if (obj->dkim == NULL) {
    Nan::ThrowTypeError(
      "eom(): sign() or verify(), then body() must be called first"
    );
    return;
  }

  if (info.Length() > 0) {
     if (!info[0]->IsObject()) {
        Nan::ThrowTypeError("eom(): Argument should be an object");
     } else {
        returntest = _value_to_bool(info[0], "testkey");
     }
  }

  statp = dkim_eom(obj->dkim, &testkey);

  // Test for error and throw an exception back to js.
  if (statp != DKIM_STAT_OK) {
    throw_error(statp);
    return;
  }

  // success
  if (returntest) {
     info.GetReturnValue().Set(Nan::New<v8::Boolean>((testkey ? true : false)));
  } else {
     info.GetReturnValue().Set(info.This());
  }
}

NAN_METHOD(OpenDKIM::GetSignature) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());

  if (obj->sig != NULL) {
    info.GetReturnValue().Set(info.This());
    return;
  }

  if (obj->dkim == NULL) {
    Nan::ThrowTypeError(
      "get_signature(): library must be initialized first"
    );
    return;
  }

  obj->sig = dkim_getsignature(obj->dkim);

  // Test for NULL and throw an exception back to js.
  if (obj->sig == NULL) {
    // TODO(godsflaw): just because there is no signature, doesn't mean this is an error.
    // we may want to do something better here, or there might be something we can
    // use in libopendkim to flag that this is a signature-less message.
    Nan::ThrowTypeError(
      "get_signature(): either there was no signature or called before eom() or chunk_end()"
    );
    return;
  }

  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(OpenDKIM::SigGetIdentity) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  DKIM_STAT statp = DKIM_STAT_OK;
  char* data = NULL;
  int data_size = (IDENTITY_SIZE + 1) * sizeof(char);

  if (obj->dkim == NULL) {
    Nan::ThrowTypeError(
      "sig_getidentity(): library must be initialized first"
    );
    goto finish_sig_getidentity;
  }

  obj->GetSignature(info);

  if (obj->sig == NULL) {
    Nan::ThrowTypeError(
      "sig_getidentity(): get_signature() failed, call it first for more details"
    );
    goto finish_sig_getidentity;
  }

  if ((data = (char*)malloc(data_size)) == NULL) {
    Nan::ThrowTypeError(
      "sig_getidentity(): allocation failure, out of memory"
    );
    goto finish_sig_getidentity;
  }

  while ((statp = dkim_sig_getidentity(obj->dkim, obj->sig, (unsigned char*)data, data_size)) ==
          DKIM_STAT_NORESOURCE) {
    data_size *= 2;
    char* tmp = (char*)realloc(data, data_size);
    if (tmp == NULL) {
      Nan::ThrowTypeError(
        "sig_getidentity(): allocation failure, out of memory"
      );
      goto finish_sig_getidentity;
    } else {
      data = tmp;
    }
  }

  if (statp != DKIM_STAT_OK) {
    throw_error(statp);
    goto finish_sig_getidentity;
  }

  info.GetReturnValue().Set(Nan::New<v8::String>(data).ToLocalChecked());

  finish_sig_getidentity:
    _safe_free(&data);
}

NAN_METHOD(OpenDKIM::SigGetDomain) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  unsigned char* data = NULL;

  if (obj->dkim == NULL) {
    Nan::ThrowTypeError(
      "sig_getdomain(): library must be initialized first"
    );
    return;
  }

  obj->GetSignature(info);

  if (obj->sig == NULL) {
    Nan::ThrowTypeError(
      "sig_getdomain(): get_signature() failed, call it first for more details"
    );
    return;
  }

  if ((data = dkim_sig_getdomain(obj->sig)) == NULL) {
    info.GetReturnValue().Set(Nan::New<v8::String>("").ToLocalChecked());
  } else {
    info.GetReturnValue().Set(Nan::New<v8::String>((char *)data).ToLocalChecked());
  }
}

NAN_METHOD(OpenDKIM::SigGetSelector) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  unsigned char* data = NULL;

  if (obj->dkim == NULL) {
    Nan::ThrowTypeError(
      "sig_getselector(): library must be initialized first"
    );
    return;
  }

  obj->GetSignature(info);

  if (obj->sig == NULL) {
    Nan::ThrowTypeError(
      "sig_getselector(): get_signature() failed, call it first for more details"
    );
    return;
  }

  if ((data = dkim_sig_getselector(obj->sig)) == NULL) {
    info.GetReturnValue().Set(Nan::New<v8::String>("").ToLocalChecked());
  } else {
    info.GetReturnValue().Set(Nan::New<v8::String>((char *)data).ToLocalChecked());
  }
}

NAN_METHOD(OpenDKIM::SigGetError) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  int data = 0;

  if (obj->dkim == NULL) {
    Nan::ThrowTypeError(
      "sig_geterror(): library must be initialized first"
    );
    return;
  }

  obj->GetSignature(info);

  if (obj->sig == NULL) {
    Nan::ThrowTypeError(
      "sig_geterror(): get_signature() failed, call it first for more details"
    );
    return;
  }

  data = dkim_sig_geterror(obj->sig);
  info.GetReturnValue().Set(Nan::New<v8::Int32>(data));
}

NAN_METHOD(OpenDKIM::SigGetErrorStr) {
  const char *errorstr = NULL;

  if (info.Length() != 1) {
    Nan::ThrowTypeError("sig_geterrorstr(): Wrong number of arguments");
    return;
  }

  errorstr = dkim_sig_geterrorstr(info[0]->NumberValue());

  info.GetReturnValue().Set(Nan::New<v8::String>(errorstr).ToLocalChecked());
}

NAN_METHOD(OpenDKIM::SigGetCanonlen) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
   ssize_t msglen, canonlen, signlen;

  if (obj->dkim == NULL) {
    Nan::ThrowTypeError(
      "sig_geterror(): library must be initialized first"
    );
    return;
  }

  obj->GetSignature(info);

  if (obj->sig == NULL) {
    Nan::ThrowTypeError(
      "sig_geterror(): get_signature() failed, call it first for more details"
    );
    return;
  }

  dkim_sig_getcanonlen(obj->dkim, obj->sig, &msglen, &canonlen, &signlen);

  v8::Local<v8::Object> jsonObject = Nan::New<v8::Object>();

  v8::Local<v8::String> msglenProp = Nan::New("msglen").ToLocalChecked();
  v8::Local<v8::String> canonlenProp = Nan::New("canonlen").ToLocalChecked();
  v8::Local<v8::String> signlenProp = Nan::New("signlen").ToLocalChecked();

  v8::Local<v8::Value> msglenValue = Nan::New((int)msglen);
  v8::Local<v8::Value> canonlenValue = Nan::New((int)canonlen);
  v8::Local<v8::Value> signlenValue = Nan::New((int)signlen);

  Nan::Set(jsonObject, msglenProp, msglenValue);
  Nan::Set(jsonObject, canonlenProp, canonlenValue);
  Nan::Set(jsonObject, signlenProp, signlenValue);

  info.GetReturnValue().Set(jsonObject);
}

NAN_METHOD(OpenDKIM::Chunk) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  DKIM_STAT statp = DKIM_STAT_OK;
  char *message = NULL;
  int length = 0;

  if (info.Length() != 1) {
    Nan::ThrowTypeError("chunk(): Wrong number of arguments");
    goto finish_chunk;
  }

  if (!info[0]->IsObject()) {
    Nan::ThrowTypeError("chunk(): Argument should be an object");
    goto finish_chunk;
  }

  if (!_value_to_char(info[0], "message", &message)) {
    Nan::ThrowTypeError("chunk(): message is undefined");
    goto finish_chunk;
  }

  // length
  length = _value_to_int(info[0], "length");
  if (length == 0) {
    Nan::ThrowTypeError("chunk(): length must be defined and non-zero");
    goto finish_chunk;
  }

  if (obj->dkim == NULL) {
    Nan::ThrowTypeError("chunk(): sign() or verify() must be called first");
    goto finish_chunk;
  }

  statp = dkim_chunk(obj->dkim, (unsigned char *)message, length);

  // Test for error and throw an exception back to js.
  if (statp != DKIM_STAT_OK) {
    throw_error(statp);
    goto finish_chunk;
  }

  finish_chunk:
    _safe_free(&message);

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
  dkim_canon_t hdrcanon_alg = DKIM_CANON_SIMPLE;
  dkim_canon_t bodycanon_alg = DKIM_CANON_SIMPLE;
  dkim_alg_t sign_alg = DKIM_SIGN_RSASHA256;
  char *id = NULL;
  char *secretkey = NULL;
  char *selector = NULL;
  char *domain = NULL;
  char *hdrcanon = NULL;
  char *bodycanon = NULL;
  char *signalg = NULL;
  int length = -1;

  if (info.Length() != 1) {
    Nan::ThrowTypeError("sign(): Wrong number of arguments");
    goto finish_sign;
  }

  if (!info[0]->IsObject()) {
    Nan::ThrowTypeError("sign(): Argument should be an object");
    goto finish_sign;
  }

  // id
  _value_to_char(info[0], "id", &id);

  // secretkey
  if (!_value_to_char(info[0], "secretkey", &secretkey)) {
    Nan::ThrowTypeError("sign(): secretkey is undefined");
    goto finish_sign;
  }

  // selector
  if (!_value_to_char(info[0], "selector", &selector)) {
    Nan::ThrowTypeError("sign(): selector is undefined");
    goto finish_sign;
  }

  // domain
  if (!_value_to_char(info[0], "domain", &domain)) {
    Nan::ThrowTypeError("sign(): domain is undefined");
    goto finish_sign;
  }

  // hdrcanon
  if (!_value_to_char(info[0], "hdrcanon", &hdrcanon)) {
    Nan::ThrowTypeError("sign(): hdrcanon is undefined");
    goto finish_sign;
  }
  for (int i = 0 ; hdrcanon[i] != '\0'; i++) hdrcanon[i] = tolower(hdrcanon[i]);

  if (strcmp(hdrcanon, "relaxed") == 0) {
    hdrcanon_alg = DKIM_CANON_RELAXED;
  }

  // bodycanon
  if (!_value_to_char(info[0], "bodycanon", &bodycanon)) {
    Nan::ThrowTypeError("sign(): bodycanon is undefined");
    goto finish_sign;
  }
  for (int i = 0 ; bodycanon[i] != '\0'; i++) bodycanon[i] = tolower(bodycanon[i]);

  if (strcmp(bodycanon, "relaxed") == 0) {
    bodycanon_alg = DKIM_CANON_RELAXED;
  }

  // signalg, the default is now sha256 due to weakness in sha1
  if (_value_to_char(info[0], "signalg", &signalg)) {
    for (int i = 0 ; signalg[i] != '\0'; i++) signalg[i] = tolower(signalg[i]);

    if (strcmp(signalg, "sha1") == 0) {
      sign_alg = DKIM_SIGN_RSASHA1;
    }
  }

  // length
  length = _value_to_int(info[0], "length");

  // free this to clear the old context
  if (obj->dkim != NULL) {
    dkim_free(obj->dkim);
    obj->dkim = NULL;
  }

  obj->dkim = dkim_sign(
    dkim_lib,
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
    goto finish_sign;
  }

  finish_sign:
    _safe_free(&id);
    _safe_free(&secretkey);
    _safe_free(&selector);
    _safe_free(&domain);
    _safe_free(&hdrcanon);
    _safe_free(&bodycanon);
    _safe_free(&signalg);

  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(OpenDKIM::Verify) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  DKIM_STAT statp = DKIM_STAT_OK;
  char *id = NULL;

  if (info.Length() != 1) {
    Nan::ThrowTypeError("verify(): Wrong number of arguments");
    goto finish_verify;
  }

  if (!info[0]->IsObject()) {
    Nan::ThrowTypeError("verify(): Argument should be an object");
    goto finish_verify;
  }

  // id
  _value_to_char(info[0], "id", &id);

  // free this to clear the old context
  if (obj->dkim != NULL) {
    dkim_free(obj->dkim);
    obj->dkim = NULL;
  }

  obj->dkim = dkim_verify(dkim_lib, (unsigned char *)id, NULL, &statp);

  // Test for error and throw an exception back to js.
  if (obj->dkim == NULL) {
    throw_error(statp);
    goto finish_verify;
  }

  finish_verify:
    _safe_free(&id);

  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(OpenDKIM::GetOption) {
  DKIM_STAT statp = DKIM_STAT_OK;
  char *option = NULL;
  int opt = 0;

  if (info.Length() != 1) {
    Nan::ThrowTypeError("get_option(): Wrong number of arguments");
    return;
  }

  if (!info[0]->IsObject()) {
    Nan::ThrowTypeError("get_option(): Argument should be an object");
    return;
  }

  // option
  if (!_value_to_char(info[0], "option", &option)) {
    Nan::ThrowTypeError("get_option(): option is undefined");
    return;
  }

  opt = _get_option(option, strlen(option));
  _safe_free(&option);

  // because data can vary, we have to do something different for each option
  if (opt == DKIM_OPTS_QUERYINFO || opt == DKIM_OPTS_TMPDIR) {
    char data[MAXPATHLEN + 1] = "";
    statp = dkim_options(
      dkim_lib,
      DKIM_OP_GETOPT,
      opt,
      &data,
      sizeof(data)
    );

    if (statp != DKIM_STAT_OK) {
      throw_error(statp);
      return;
    }

    info.GetReturnValue().Set(Nan::New<v8::String>(data).ToLocalChecked());
  } else if (opt == DKIM_OPTS_QUERYMETHOD) {
    dkim_query_t data;
    statp = dkim_options(
      dkim_lib,
      DKIM_OP_GETOPT,
      opt,
      &data,
      sizeof(data)
    );

    if (statp != DKIM_STAT_OK) {
      throw_error(statp);
      return;
    }

    if (data == DKIM_QUERY_FILE) {
      info.GetReturnValue().Set(Nan::New<v8::String>("DKIM_QUERY_FILE").ToLocalChecked());
    } else {
      info.GetReturnValue().Set(Nan::New<v8::String>("DKIM_QUERY_DNS").ToLocalChecked());
    }
  } else {
    Nan::ThrowError("get_option(): invalid option");
  }

  return;
}

NAN_METHOD(OpenDKIM::SetOption) {
  DKIM_STAT statp = DKIM_STAT_OK;
  char *option = NULL;
  char *data = NULL;
  int length = 0;
  int opt = 0;

  if (info.Length() != 1) {
    Nan::ThrowTypeError("set_option(): Wrong number of arguments");
    goto finish_set_option;
  }

  if (!info[0]->IsObject()) {
    Nan::ThrowTypeError("set_option(): Argument should be an object");
    goto finish_set_option;
  }

  // option
  if (!_value_to_char(info[0], "option", &option)) {
    Nan::ThrowTypeError("set_option(): option is undefined");
    goto finish_set_option;
  }

  // data
  if (!_value_to_char(info[0], "data", &data)) {
    Nan::ThrowTypeError("set_option(): data is undefined");
    goto finish_set_option;
  }

  // length
  length = _value_to_int(info[0], "length");
  if (length == 0) {
    Nan::ThrowTypeError("set_option(): length must be defined and non-zero");
    goto finish_set_option;
  }

  opt = _get_option(option, strlen(option));

  // because data can vary, we have to do something different for each option
  if (opt == DKIM_OPTS_QUERYINFO || opt == DKIM_OPTS_TMPDIR) {
    if (length > MAXPATHLEN + 1) {
      Nan::ThrowTypeError("set_option(): filename too long");
      goto finish_set_option;
    }

    statp = dkim_options(
      dkim_lib,
      DKIM_OP_SETOPT,
      opt,
      data,
      length
    );
  } else if (opt == DKIM_OPTS_QUERYMETHOD) {
    dkim_query_t qtype = DKIM_QUERY_DNS;
    if (strncmp(data, "DKIM_QUERY_FILE", length) == 0) {
      qtype = DKIM_QUERY_FILE;
    }

    statp = dkim_options(
      dkim_lib,
      DKIM_OP_SETOPT,
      opt,
      &qtype,
      sizeof(qtype)
    );
  } else {
    Nan::ThrowTypeError("set_option(): invalid option");
    goto finish_set_option;
  }

  // Test for error and throw an exception back to js.
  if (statp != DKIM_STAT_OK) {
    throw_error(statp);
    goto finish_set_option;
  }

  finish_set_option:
    _safe_free(&option);
    _safe_free(&data);

  info.GetReturnValue().Set(info.This());
}

#define MAXHDRCOUNT 100000

NAN_METHOD(OpenDKIM::OHDRS) {
   OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
   unsigned char *ohdrs[MAXHDRCOUNT];
   int nhdrs = MAXHDRCOUNT;
   DKIM_STAT statp = DKIM_STAT_OK;

   Isolate* isolate = info.GetIsolate(); // Needed to make new array

   if (obj->sig == NULL) {
      Nan::ThrowTypeError("ohdrs(): either there was no signature or called before eom() or chunk_end()");
      return;
   }

   statp = dkim_ohdrs(obj->dkim, obj->sig, ohdrs, &nhdrs);

   if (statp != DKIM_STAT_OK) {
      throw_error(statp);
      return;
   }

   Local<Array> zheaders = Array::New(isolate);
   for (int i = 0; i < nhdrs; i++) {
      Nan::Set(zheaders, i, Nan::New<String>((char*)ohdrs[i]).ToLocalChecked());
   }

   info.GetReturnValue().Set(zheaders);
}

NAN_METHOD(OpenDKIM::LibFeature) {
  char *feature = NULL;
  unsigned int feature_int = 0;
  _Bool result = 0;

  if (info.Length() != 1) {
    Nan::ThrowTypeError("lib_feature(): Wrong number of arguments");
    goto finish_lib_feature;
  }

  if (!info[0]->IsObject()) {
    Nan::ThrowTypeError("lib_feature(): Argument should be an object");
    goto finish_lib_feature;
  }

  // feature
  if (!_value_to_char(info[0], "feature", &feature)) {
    Nan::ThrowTypeError("lib_feature(): Feature is undefined");
    goto finish_lib_feature;
  }

  // Convert feature into the appropriate int
  if (strcmp(feature, "DKIM_FEATURE_DIFFHEADERS") == 0) { feature_int = DKIM_FEATURE_DIFFHEADERS; }
  else if (strcmp(feature, "DKIM_FEATURE_PARSE_TIME") == 0) { feature_int = DKIM_FEATURE_PARSE_TIME; }
  else if (strcmp(feature, "DKIM_FEATURE_QUERY_CACHE") == 0) { feature_int = DKIM_FEATURE_QUERY_CACHE; }
  else if (strcmp(feature, "DKIM_FEATURE_SHA256") == 0) { feature_int = DKIM_FEATURE_SHA256; }
  else if (strcmp(feature, "DKIM_FEATURE_DNSSEC") == 0) { feature_int = DKIM_FEATURE_DNSSEC; }
  else if (strcmp(feature, "DKIM_FEATURE_OVERSIGN") == 0) { feature_int = DKIM_FEATURE_OVERSIGN; }
  else {
      Nan::ThrowTypeError("lib_feature(): Invalid feature");
      goto finish_lib_feature;
  }


  result = dkim_libfeature(dkim_lib, feature_int);

  finish_lib_feature:
    _safe_free(&feature);

  info.GetReturnValue().Set(Nan::New<v8::Boolean>(result));
}

NODE_MODULE(opendkim, OpenDKIM::Init)

}
