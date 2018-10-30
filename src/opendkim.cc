#include "opendkim.h"
#include "opendkim_body_async.h"
#include "opendkim_chunk_async.h"
#include "opendkim_chunk_end_async.h"
#include "opendkim_eoh_async.h"
#include "opendkim_eom_async.h"
#include "opendkim_flush_cache_async.h"
#include "opendkim_header_async.h"
#include "opendkim_sign_async.h"
#include "opendkim_verify_async.h"
#include <stdio.h>
#include <unistd.h>    // TODO(godsflaw): port for windows?

#define IDENTITY_SIZE 64
#define MAXHDRCOUNT 100000


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
  Nan::SetPrototypeMethod(tpl, "native_flush_cache", FlushCache);
  Nan::SetPrototypeMethod(tpl, "native_flush_cache_sync", FlushCacheSync);
  Nan::SetPrototypeMethod(tpl, "native_lib_feature", LibFeature);

  // Processing methods
  Nan::SetPrototypeMethod(tpl, "native_chunk", Chunk);
  Nan::SetPrototypeMethod(tpl, "native_chunk_sync", ChunkSync);
  Nan::SetPrototypeMethod(tpl, "native_chunk_end", ChunkEnd);
  Nan::SetPrototypeMethod(tpl, "native_chunk_end_sync", ChunkEndSync);
  Nan::SetPrototypeMethod(tpl, "native_header", Header);
  Nan::SetPrototypeMethod(tpl, "native_header_sync", HeaderSync);
  Nan::SetPrototypeMethod(tpl, "native_eoh", EOH);
  Nan::SetPrototypeMethod(tpl, "native_eoh_sync", EOHSync);
  Nan::SetPrototypeMethod(tpl, "native_body", Body);
  Nan::SetPrototypeMethod(tpl, "native_body_sync", BodySync);
  Nan::SetPrototypeMethod(tpl, "native_eom", EOM);
  Nan::SetPrototypeMethod(tpl, "native_eom_sync", EOMSync);

  // Signing methods
  Nan::SetPrototypeMethod(tpl, "native_sign", Sign);
  Nan::SetPrototypeMethod(tpl, "native_sign_sync", SignSync);

  // Verifying methods
  Nan::SetPrototypeMethod(tpl, "native_get_signature", GetSignature);
  Nan::SetPrototypeMethod(tpl, "native_ohdrs", OHDRS);
  Nan::SetPrototypeMethod(tpl, "native_sig_getcanonlen", SigGetCanonlen);
  Nan::SetPrototypeMethod(tpl, "native_sig_getdomain", SigGetDomain);
  Nan::SetPrototypeMethod(tpl, "native_sig_geterror", SigGetError);
  Nan::SetPrototypeMethod(tpl, "native_sig_geterrorstr", SigGetErrorStr);
  Nan::SetPrototypeMethod(tpl, "native_sig_getidentity", SigGetIdentity);
  Nan::SetPrototypeMethod(tpl, "native_sig_getselector", SigGetSelector);
  Nan::SetPrototypeMethod(tpl, "native_verify", Verify);
  Nan::SetPrototypeMethod(tpl, "native_verify_sync", VerifySync);

  // Utility methods
  Nan::SetPrototypeMethod(tpl, "native_get_option", GetOption);
  Nan::SetPrototypeMethod(tpl, "native_set_option", SetOption);

  // Debug methods
  Nan::SetPrototypeMethod(tpl, "native_diffheaders", Diffheaders);
  
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
  // dispatch this job to a worker
  Nan::AsyncQueueWorker(new OpenDKIMFlushCacheAsyncWorker(info));
  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(OpenDKIM::FlushCacheSync) {
  int records;
  const char *result = NULL;

  // call synchronously
  result = FlushCacheBase(&records);

  if (result != NULL) {
    Nan::ThrowTypeError(result);
  }

  if (records != -1) {
    info.GetReturnValue().Set(Nan::New<v8::Integer>(records));
  } else {
    info.GetReturnValue().Set(Nan::Undefined());
  }
}

const char *OpenDKIM::FlushCacheBase(int *records)
{
  const char *result = NULL;

  if (dkim_lib == NULL) {
    result = "flush_cache(): library must be initialized first";
    goto finish_flush_cache_base;
  }

  *records = dkim_flush_cache(dkim_lib);

  finish_flush_cache_base:

  return result;
}

NAN_METHOD(OpenDKIM::Header) {
  // dispatch this job to a worker
  Nan::AsyncQueueWorker(new OpenDKIMHeaderAsyncWorker(info));
  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(OpenDKIM::HeaderSync) {
  const char *result = NULL;
  OpenDKIM* obj = NULL;
  char *header = NULL;
  int length = 0;

  result = HeaderArgs(
    info,
    &obj,
    &header,
    &length
  );

  // skip HeaderBase if we have an argument error
  if (result != NULL) {
    goto finish_header_sync;
  }

  // call synchronously
  result = HeaderBase(obj, header, length);

  finish_header_sync:

  if (result != NULL) {
    Nan::ThrowTypeError(result);
  }

  info.GetReturnValue().Set(info.This());
}

const char *OpenDKIM::HeaderArgs(
  Nan::NAN_METHOD_ARGS_TYPE info,
  OpenDKIM **obj,
  char **header,
  int *length) {
  const char *result = NULL;
  *obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  *header = NULL;
  *length = -1;

  if (!info[0]->IsObject()) {
    result = "header(): Argument should be an object";
    goto finish_header_args;
  }

  // header
  if (!_value_to_char(info[0], "header", header)) {
    result = "header(): header is undefined";
    goto finish_header_args;
  }

  // length
  *length = _value_to_int(info[0], "length");
  if (*length == 0) {
    result = "header(): length must be defined and non-zero";
    goto finish_header_args;
  }

  if ((*obj)->dkim == NULL) {
    result = "header(): sign() or verify() must be called first";
    goto finish_header_args;
  }

  finish_header_args:

  if (result != NULL) {
    _safe_free(header);
  }

  return result;
}

const char *OpenDKIM::HeaderBase(
  OpenDKIM *obj,
  char *header,
  int length)
{
  const char *result = NULL;
  DKIM_STAT statp = DKIM_STAT_OK;

  statp = dkim_header(obj->dkim, (unsigned char *)header, length);

  // Test for error and throw an exception back to js.
  if (statp != DKIM_STAT_OK) {
    result = get_error(statp);
  }

  _safe_free(&header);

  return result;
}

NAN_METHOD(OpenDKIM::EOH) {
  // dispatch this job to a worker
  Nan::AsyncQueueWorker(new OpenDKIMEOHAsyncWorker(info));
  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(OpenDKIM::EOHSync) {
  const char *result = NULL;
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());

  // call synchronously
  result = EOHBase(obj);

  if (result != NULL) {
    Nan::ThrowTypeError(result);
  }

  info.GetReturnValue().Set(info.This());
}

const char *OpenDKIM::EOHBase(OpenDKIM *obj)
{
  const char *result = NULL;
  DKIM_STAT statp = DKIM_STAT_OK;

  if (obj->dkim == NULL) {
    result = "eoh(): sign() or verify(), then header() must be called first";
    goto finish_eoh_base;
  }

  statp = dkim_eoh(obj->dkim);

  // Test for error and throw an exception back to js.
  if (statp != DKIM_STAT_OK) {
    result = get_error(statp);
  }

  finish_eoh_base:

  return result;
}

NAN_METHOD(OpenDKIM::Body) {
  // dispatch this job to a worker
  Nan::AsyncQueueWorker(new OpenDKIMBodyAsyncWorker(info));
  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(OpenDKIM::BodySync) {
  const char *result = NULL;
  OpenDKIM* obj = NULL;
  char *body = NULL;
  int length = 0;

  result = BodyArgs(
    info,
    &obj,
    &body,
    &length
  );

  // skip BodyBase if we have an argument error
  if (result != NULL) {
    goto finish_body_sync;
  }

  // call synchronously
  result = BodyBase(obj, body, length);

  finish_body_sync:

  if (result != NULL) {
    Nan::ThrowTypeError(result);
  }

  info.GetReturnValue().Set(info.This());
}

const char *OpenDKIM::BodyArgs(
  Nan::NAN_METHOD_ARGS_TYPE info,
  OpenDKIM **obj,
  char **body,
  int *length) {
  const char *result = NULL;
  *obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  *body = NULL;
  *length = -1;

  if (!info[0]->IsObject()) {
    result = "body(): Argument should be an object";
    goto finish_body_args;
  }

  // body
  if (!_value_to_char(info[0], "body", body)) {
    result = "body(): body is undefined";
    goto finish_body_args;
  }

  // length
  *length = _value_to_int(info[0], "length");
  if (*length == 0) {
    result = "body(): length must be defined and non-zero";
    goto finish_body_args;
  }

  if ((*obj)->dkim == NULL) {
    result = "body(): sign() or verify() must be called first";
    goto finish_body_args;
  }

  finish_body_args:

  if (result != NULL) {
    _safe_free(body);
  }

  return result;
}

const char *OpenDKIM::BodyBase(
  OpenDKIM *obj,
  char *body,
  int length)
{
  const char *result = NULL;
  DKIM_STAT statp = DKIM_STAT_OK;

  statp = dkim_body(obj->dkim, (unsigned char *)body, length);

  // Test for error and throw an exception back to js.
  if (statp != DKIM_STAT_OK) {
    result = get_error(statp);
  }

  _safe_free(&body);

  return result;
}

NAN_METHOD(OpenDKIM::EOMSync) {
  const char *result = NULL;
  bool testkey = false;
  bool returntest = false;
  OpenDKIM* obj = NULL;

  result = EOMArgs(info, &obj, &returntest);

  // skip EOMBase if we have an argument error
  if (result != NULL) {
    goto finish_eom_sync;
  }

  // call synchronously
  result = EOMBase(obj, &testkey);

  finish_eom_sync:

  if (result != NULL) {
    Nan::ThrowTypeError(result);
  }

  // success
  if (returntest) {
    info.GetReturnValue().Set(Nan::New<v8::Boolean>((testkey ? true : false)));
  } else {
    info.GetReturnValue().Set(info.This());
  }
}

NAN_METHOD(OpenDKIM::EOM) {
  // dispatch this job to a worker
  Nan::AsyncQueueWorker(new OpenDKIMEOMAsyncWorker(info));
  info.GetReturnValue().Set(info.This());
}

const char *OpenDKIM::EOMArgs(
  Nan::NAN_METHOD_ARGS_TYPE info,
  OpenDKIM **obj,
  bool *returntest) {
  const char *result = NULL;
  *obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  *returntest = false;

  if ((*obj)->dkim == NULL) {
    result = "eom(): sign() or verify(), then body() must be called first";
    goto finish_eom_args;
  }

  if (info.Length() > 0) {
    if (!info[0]->IsObject()) {
      result = "eom(): Argument should be an object";
      goto finish_eom_args;
    } else {
      *returntest = _value_to_bool(info[0], "testkey");
    }
  }

  finish_eom_args:

  return result;
}

const char *OpenDKIM::EOMBase(OpenDKIM *obj, bool *testkey)
{
  const char *result = NULL;
  DKIM_STAT statp = DKIM_STAT_OK;

  if (obj->dkim == NULL) {
    result = "eom(): sign() or verify(), then body() must be called first";
    goto finish_eom_base;
  }

  statp = dkim_eom(obj->dkim, testkey);

  // Test for error and throw an exception back to js.
  if (statp != DKIM_STAT_OK) {
    result = get_error(statp);
  }

  finish_eom_base:

  return result;
}

NAN_METHOD(OpenDKIM::GetSignature) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());

  if (obj->sig != NULL) {
    goto finish_getsignature;
  }

  if (obj->dkim == NULL) {
    Nan::ThrowTypeError(
      "get_signature(): library must be initialized first"
    );
    goto finish_getsignature;
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
    goto finish_getsignature;
  }

  finish_getsignature:

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

  if (data == NULL) {
    info.GetReturnValue().Set(Nan::New<v8::String>("").ToLocalChecked());
  } else {
    info.GetReturnValue().Set(Nan::New<v8::String>((char *)data).ToLocalChecked());
  }

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

  v8::Local<v8::String> msglenProp = Nan::New<v8::String>("msglen").ToLocalChecked();
  v8::Local<v8::String> canonlenProp = Nan::New<v8::String>("canonlen").ToLocalChecked();
  v8::Local<v8::String> signlenProp = Nan::New<v8::String>("signlen").ToLocalChecked();

  v8::Local<v8::Value> msglenValue = Nan::New<v8::Number>(msglen);
  v8::Local<v8::Value> canonlenValue = Nan::New<v8::Number>(canonlen);
  v8::Local<v8::Value> signlenValue = Nan::New<v8::Number>(signlen);

  Nan::Set(jsonObject, msglenProp, msglenValue);
  Nan::Set(jsonObject, canonlenProp, canonlenValue);
  Nan::Set(jsonObject, signlenProp, signlenValue);

  info.GetReturnValue().Set(jsonObject);
}

NAN_METHOD(OpenDKIM::Chunk) {
  // dispatch this job to a worker
  Nan::AsyncQueueWorker(new OpenDKIMChunkAsyncWorker(info));
  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(OpenDKIM::ChunkSync) {
  const char *result = NULL;
  OpenDKIM* obj = NULL;
  char *message = NULL;
  int length = 0;

  result = ChunkArgs(
    info,
    &obj,
    &message,
    &length
  );

  // skip ChunkBase if we have an argument error
  if (result != NULL) {
    goto finish_chunk_sync;
  }

  // call synchronously
  result = ChunkBase(obj, message, length);

  finish_chunk_sync:

  if (result != NULL) {
    Nan::ThrowTypeError(result);
  }

  info.GetReturnValue().Set(info.This());
}

const char *OpenDKIM::ChunkArgs(
  Nan::NAN_METHOD_ARGS_TYPE info,
  OpenDKIM **obj,
  char **message,
  int *length) {
  const char *result = NULL;
  *obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  *message = NULL;
  *length = -1;

  if (!info[0]->IsObject()) {
    result = "chunk(): Argument should be an object";
    goto finish_chunk_args;
  }

  // message
  if (!_value_to_char(info[0], "message", message)) {
    result = "chunk(): message is undefined";
    goto finish_chunk_args;
  }

  // length
  *length = _value_to_int(info[0], "length");
  if (*length == 0) {
    result = "chunk(): length must be defined and non-zero";
    goto finish_chunk_args;
  }

  if ((*obj)->dkim == NULL) {
    result = "chunk(): sign() or verify() must be called first";
    goto finish_chunk_args;
  }

  finish_chunk_args:

  if (result != NULL) {
    _safe_free(message);
  }

  return result;
}

const char *OpenDKIM::ChunkBase(
  OpenDKIM *obj,
  char *message,
  int length)
{
  const char *result = NULL;
  DKIM_STAT statp = DKIM_STAT_OK;

  statp = dkim_chunk(obj->dkim, (unsigned char *)message, length);

  // Test for error and throw an exception back to js.
  if (statp != DKIM_STAT_OK) {
    result = get_error(statp);
  }

  _safe_free(&message);

  return result;
}

NAN_METHOD(OpenDKIM::ChunkEnd) {
  // dispatch this job to a worker
  Nan::AsyncQueueWorker(new OpenDKIMChunkEndAsyncWorker(info));
  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(OpenDKIM::ChunkEndSync) {
  const char *result = NULL;
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());

  // call synchronously
  result = ChunkEndBase(obj);

  if (result != NULL) {
    Nan::ThrowTypeError(result);
  }

  info.GetReturnValue().Set(info.This());
}

const char *OpenDKIM::ChunkEndBase(OpenDKIM *obj)
{
  const char *result = NULL;
  bool testkey = false;
  DKIM_STAT statp = DKIM_STAT_OK;

  if (obj->dkim == NULL) {
    result = "chunk_end(): sign() or verify(), then chunk() must be called first";
    goto finish_chunk_end_base;
  }

  // When done with calling chunk(), we need to call it with NULL pointer and 0 length.
  statp = dkim_chunk(obj->dkim, NULL, 0);

  // Test for error and throw an exception back to js.
  if (statp != DKIM_STAT_OK) {
    result = get_error(statp);
    goto finish_chunk_end_base;
  }

  // We also need to call dkim_eom(), so we can just call that method.
  result = obj->EOMBase(obj, &testkey);

  finish_chunk_end_base:

  return result;
}

NAN_METHOD(OpenDKIM::Sign) {
  // dispatch this job to a worker
  Nan::AsyncQueueWorker(new OpenDKIMSignAsyncWorker(info));
  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(OpenDKIM::SignSync) {
  const char *result = NULL;
  OpenDKIM *obj = NULL;
  char *id = NULL;
  char *secretkey = NULL;
  char *selector = NULL;
  char *domain = NULL;
  char *hdrcanon = NULL;
  char *bodycanon = NULL;
  char *signalg = NULL;
  int length = -1;

  result = SignArgs(
    info,
    &obj,
    &id,
    &secretkey,
    &selector,
    &domain,
    &hdrcanon,
    &bodycanon,
    &signalg,
    &length
  );

  // skip SignBase if we have an argument error
  if (result != NULL) {
    goto finish_sign_sync;
  }

  // call synchronously
  result = SignBase(
    obj, id, secretkey, selector, domain, hdrcanon, bodycanon, signalg, length
  );

  finish_sign_sync:

  if (result != NULL) {
    Nan::ThrowTypeError(result);
  }

  info.GetReturnValue().Set(info.This());
}

const char *OpenDKIM::SignArgs(
  Nan::NAN_METHOD_ARGS_TYPE info,
  OpenDKIM **obj,
  char **id,
  char **secretkey,
  char **selector,
  char **domain,
  char **hdrcanon,
  char **bodycanon,
  char **signalg,
  int *length) {
  const char *result = NULL;
  *obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  *id = NULL;
  *secretkey = NULL;
  *selector = NULL;
  *domain = NULL;
  *hdrcanon = NULL;
  *bodycanon = NULL;
  *signalg = NULL;
  *length = -1;

  if (!info[0]->IsObject()) {
    result = "sign(): Argument should be an object";
    goto finish_sign_args;
  }

  // id
  _value_to_char(info[0], "id", id);

  // secretkey
  if (!_value_to_char(info[0], "secretkey", secretkey)) {
    result = "sign(): secretkey is undefined";
    goto finish_sign_args;
  }

  // selector
  if (!_value_to_char(info[0], "selector", selector)) {
    result = "sign(): selector is undefined";
    goto finish_sign_args;
  }

  // domain
  if (!_value_to_char(info[0], "domain", domain)) {
    result = "sign(): domain is undefined";
    goto finish_sign_args;
  }

  // hdrcanon
  if (!_value_to_char(info[0], "hdrcanon", hdrcanon)) {
    result = "sign(): hdrcanon is undefined";
    goto finish_sign_args;
  }

  // bodycanon
  if (!_value_to_char(info[0], "bodycanon", bodycanon)) {
    result = "sign(): bodycanon is undefined";
    goto finish_sign_args;
  }

  // signalg, the default is now sha256 due to weakness in sha1
  _value_to_char(info[0], "signalg", signalg);

  // length
  *length = _value_to_int(info[0], "length");

  finish_sign_args:

  if (result != NULL) {
    _safe_free(id);
    _safe_free(secretkey);
    _safe_free(selector);
    _safe_free(domain);
    _safe_free(hdrcanon);
    _safe_free(bodycanon);
    _safe_free(signalg);
  }

  return result;
}

const char *OpenDKIM::SignBase(
  OpenDKIM *obj,
  char *id,
  char *secretkey,
  char *selector,
  char *domain,
  char *hdrcanon,
  char *bodycanon,
  char *signalg,
  int length)
{
  const char *result = NULL;
  DKIM_STAT statp = DKIM_STAT_OK;
  dkim_canon_t hdrcanon_alg = DKIM_CANON_SIMPLE;
  dkim_canon_t bodycanon_alg = DKIM_CANON_SIMPLE;
  dkim_alg_t sign_alg = DKIM_SIGN_RSASHA256;

  // free this to clear the old context
  if (obj->dkim != NULL) {
    dkim_free(obj->dkim);
    obj->dkim = NULL;
  }

  for (int i = 0 ; hdrcanon[i] != '\0'; i++) hdrcanon[i] = tolower(hdrcanon[i]);
  if (strcmp(hdrcanon, "relaxed") == 0) {
    hdrcanon_alg = DKIM_CANON_RELAXED;
  }

  for (int i = 0 ; bodycanon[i] != '\0'; i++) bodycanon[i] = tolower(bodycanon[i]);
  if (strcmp(bodycanon, "relaxed") == 0) {
    bodycanon_alg = DKIM_CANON_RELAXED;
  }

  // signalg, the default is now sha256 due to weakness in sha1
  if (signalg) {
    for (int i = 0 ; signalg[i] != '\0'; i++) signalg[i] = tolower(signalg[i]);
    if (strcmp(signalg, "sha1") == 0) {
      sign_alg = DKIM_SIGN_RSASHA1;
    }
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
    result = get_error(statp);
  }

  _safe_free(&id);
  _safe_free(&secretkey);
  _safe_free(&selector);
  _safe_free(&domain);
  _safe_free(&hdrcanon);
  _safe_free(&bodycanon);
  _safe_free(&signalg);

  return result;
}

NAN_METHOD(OpenDKIM::Verify) {
  // dispatch this job to a worker
  Nan::AsyncQueueWorker(new OpenDKIMVerifyAsyncWorker(info));
  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(OpenDKIM::VerifySync) {
  const char *result = NULL;
  OpenDKIM *obj = NULL;
  char *id = NULL;

  result = VerifyArgs(
    info,
    &obj,
    &id
  );

  // skip VerifyBase if we have an argument error
  if (result != NULL) {
    goto finish_verify_sync;
  }

  // call synchronously
  result = VerifyBase(obj, id);

  finish_verify_sync:

  if (result != NULL) {
    Nan::ThrowTypeError(result);
  }

  info.GetReturnValue().Set(info.This());
}

const char *OpenDKIM::VerifyArgs(
  Nan::NAN_METHOD_ARGS_TYPE info,
  OpenDKIM **obj,
  char **id) {
  const char *result = NULL;
  *obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  *id = NULL;

  if (!info[0]->IsObject()) {
    result = "verify(): Argument should be an object";
    goto finish_verify_args;
  }

  // id
  _value_to_char(info[0], "id", id);

  finish_verify_args:

  if (result != NULL) {
    _safe_free(id);
  }

  return result;
}

const char *OpenDKIM::VerifyBase(OpenDKIM *obj, char *id)
{
  const char *result = NULL;
  DKIM_STAT statp = DKIM_STAT_OK;

  // free this to clear the old context
  if (obj->dkim != NULL) {
    dkim_free(obj->dkim);
    obj->dkim = NULL;
  }

  obj->dkim = dkim_verify(dkim_lib, (unsigned char *)id, NULL, &statp);

  // Test for error and throw an exception back to js.
  if (obj->dkim == NULL) {
    result = get_error(statp);
    goto finish_verify_base;
  }

  finish_verify_base:

  _safe_free(&id);

  return result;
}

NAN_METHOD(OpenDKIM::Diffheaders)
{
  OpenDKIM *obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  DKIM *dkim = obj->dkim;
  DKIM_STAT statp = DKIM_STAT_OK;
  unsigned char* ohdrs[MAXHDRCOUNT];
  int nohdrs = MAXHDRCOUNT;
  struct dkim_hdrdiff** out = (struct dkim_hdrdiff**) malloc(sizeof(struct dkim_hdrdiff*));
  dkim_canon_t* hdrcanon = (dkim_canon_t*) malloc(sizeof(dkim_canon_t));
  int maxcost = 0;
  int nout= 0;
  const char* result;
  Isolate* isolate = info.GetIsolate(); // Needed to make new array
  Local<Array> out_array = Array::New(isolate);

  if (ohdrs == NULL)
  {
    Nan::ThrowTypeError("diffheaders(): allocation failure, out of memory");
    goto clean;
  }

  if (out == NULL)
  {
    Nan::ThrowTypeError("diffheaders(): allocation failure, out of memory");
    goto clean;
  }

  if (info.Length() != 1) {
    Nan::ThrowTypeError("diffheaders(): Wrong number of arguments, you must provide a maxcost value");
    goto clean;
  }

  if (!info[0]->IsObject()) {
    Nan::ThrowTypeError("diffheaders(): Argument should be an object");
    goto clean;
  }
  
  maxcost = _value_to_int(info[0], "maxcost");

  if(maxcost == 0 ){
    Nan::ThrowTypeError("diffheaders(): Invalid maxcost cannot be 0");
    goto clean;
  }

  if (obj->dkim == NULL)
  {
    Nan::ThrowTypeError(
        "diffheaders(): library must be initialized first");
    goto clean;
  }

  obj->GetSignature(info);

  if (obj->sig == NULL)
  {
    Nan::ThrowTypeError(
        "diffheaders():  either there was no signature or called before eom() or chunk_end()");
    goto clean;
  }

  statp = dkim_sig_getcanons(obj->sig, hdrcanon, NULL);
  
  if (statp != DKIM_STAT_OK)
  {
    result = get_error(statp);
    goto clean;
  }

  if (hdrcanon == NULL)
  {
    Nan::ThrowTypeError(
        "diffheaders():  signature as no  header canonicalization mode.");
    goto clean;
  }
  
  statp = dkim_ohdrs(obj->dkim, obj->sig, ohdrs, &nohdrs);
  if (statp != DKIM_STAT_OK)
  {
    result = get_error(statp);
    Nan::ThrowTypeError(result);
    goto clean;
  }
  
  if (ohdrs == NULL)
  {
    Nan::ThrowTypeError("diffheaders(): ohdrs is NULL");
    goto clean;
  }
    
  statp = dkim_diffheaders(dkim, *hdrcanon, maxcost, (char**) ohdrs, nohdrs,  out, &nout);

  if (statp != DKIM_STAT_OK)
  {
    
    if (statp == DKIM_STAT_NOTIMPLEMENT)
    {
      result = "Not implemented: The library must be compiled with an approximate regular\n expression library in order to provide this service.\n Check libopendkim is compiled with --with-tre and --enable-diffheaders optional flags";
    }else{
      result = get_error(statp);
    }
    Nan::ThrowTypeError(result);
    goto clean;
  }

  if (nout <= MAXHDRCOUNT && nout > 0)
  {

    v8::Local<v8::String> hd_old_key = Nan::New<v8::String>("hd_old").ToLocalChecked();
    v8::Local<v8::String> hd_new_key = Nan::New<v8::String>("hd_new").ToLocalChecked();
  
    for (int i = 0; i < nout; i++)
    {
      v8::Local<v8::Object> diffObject = Nan::New<v8::Object>();
      v8::Local<v8::String> hd_old;
      v8::Local<v8::String> hd_new;
      if( (*out)[i].hd_old != NULL){
        hd_old = Nan::New<v8::String>((char *) (*out)[i].hd_old).ToLocalChecked();
      }else{
        hd_old = Nan::New<v8::String>("NULL").ToLocalChecked();
      }
      if((*out)[i].hd_new != NULL){
        hd_new = Nan::New<v8::String>((char *)(*out)[i].hd_new).ToLocalChecked();
      }else{
        hd_new = Nan::New<v8::String>("NULL").ToLocalChecked();
      }
      Nan::Set(diffObject, hd_old_key, hd_old);
      Nan::Set(diffObject, hd_new_key, hd_new);
      Nan::Set(out_array, i, diffObject);      
    }
  } else {
    Nan::ThrowTypeError("diffheaders(): too many headers to fit");
    goto clean;
  }
  
  info.GetReturnValue().Set( out_array );
  free(*out);
 
  clean:
    free(hdrcanon); 
    free(out);
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



NAN_METHOD(OpenDKIM::OHDRS) {
  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
  DKIM_STAT statp = DKIM_STAT_OK;
  unsigned char *ohdrs[MAXHDRCOUNT];
  int nhdrs = MAXHDRCOUNT;
  Isolate* isolate = info.GetIsolate(); // Needed to make new array
  Local<Array> zheaders = Array::New(isolate);

  if (obj->dkim == NULL) {
    Nan::ThrowTypeError(
      "ohdrs(): sign() or verify(), then chunk() must be called first"
    );
    goto finish_ohdrs;
  }

  obj->GetSignature(info);

  if (obj->sig == NULL) {
    Nan::ThrowTypeError(
      "ohdrs(): either there was no signature or called before eom() or chunk_end()"
    );
    goto finish_ohdrs;
  }

  statp = dkim_ohdrs(obj->dkim, obj->sig, ohdrs, &nhdrs);

  if (statp != DKIM_STAT_OK) {
    throw_error(statp);
    goto finish_ohdrs;
  }

  if (nhdrs <= MAXHDRCOUNT) {
    for (int i = 0; i < nhdrs; i++) {
      Nan::Set(zheaders, i, Nan::New<String>((char*)ohdrs[i]).ToLocalChecked());
    }
  } else {
    Nan::ThrowTypeError("ohdrs(): too many headers to fit");
  }

  finish_ohdrs:

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
  if (strcmp(feature, "DKIM_FEATURE_DIFFHEADERS") == 0) {
    feature_int = DKIM_FEATURE_DIFFHEADERS;
  } else if (strcmp(feature, "DKIM_FEATURE_PARSE_TIME") == 0) {
    feature_int = DKIM_FEATURE_PARSE_TIME;
  } else if (strcmp(feature, "DKIM_FEATURE_QUERY_CACHE") == 0) {
    feature_int = DKIM_FEATURE_QUERY_CACHE;
  } else if (strcmp(feature, "DKIM_FEATURE_SHA256") == 0) {
    feature_int = DKIM_FEATURE_SHA256;
  } else if (strcmp(feature, "DKIM_FEATURE_DNSSEC") == 0) {
    feature_int = DKIM_FEATURE_DNSSEC;
  } else if (strcmp(feature, "DKIM_FEATURE_OVERSIGN") == 0) {
    feature_int = DKIM_FEATURE_OVERSIGN;
  } else {
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
