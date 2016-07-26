#include "opendkim.h"

#include <cmath>

namespace opendkim {

using namespace Nan;

// constructor
OpenDKIM::OpenDKIM() {
  state = dkim_init(NULL, NULL);

  // Throw a memory exception
  if (state == NULL) {
    Nan::ThrowError(
      Nan::New("memory allocation failure").ToLocalChecked()
    );
  }
}

// destructor
OpenDKIM::~OpenDKIM() {
  dkim_close(state);
}

NAN_MODULE_INIT(OpenDKIM::Init) {
  v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
  tpl->SetClassName(Nan::New("OpenDKIM").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  SetPrototypeMethod(tpl, "flush_cache", FlushCache);
  SetPrototypeMethod(tpl, "pow", Pow);

  constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
  Nan::Set(
    target,
    Nan::New("OpenDKIM").ToLocalChecked(),
    Nan::GetFunction(tpl).ToLocalChecked()
  );
}

NAN_METHOD(OpenDKIM::New) {
//  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());

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

  v8::Local<v8::Integer> retval = Nan::New(dkim_flush_cache(obj->state));

  info.GetReturnValue().Set(retval);
}

NAN_METHOD(OpenDKIM::Pow) {
//  OpenDKIM* obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());

  if (info.Length() < 2) {
    Nan::ThrowTypeError("Wrong number of arguments");
    return;
  }

  if (!info[0]->IsNumber() || !info[1]->IsNumber()) {
    Nan::ThrowTypeError("Both arguments should be numbers");
    return;
  }

  double arg0 = info[0]->NumberValue();
  double arg1 = info[1]->NumberValue();
  v8::Local<v8::Number> num = Nan::New(pow(arg0, arg1));

  info.GetReturnValue().Set(num);
}

NODE_MODULE(opendkim, OpenDKIM::Init)

}
