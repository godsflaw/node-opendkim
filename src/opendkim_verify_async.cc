#include "opendkim_verify_async.h"

//
// OpenDKIM call verify function
//
void OpenDKIMVerifyAsyncWorker::Execute() {
  if (result != NULL) {
    return;
  }

  result = OpenDKIM::VerifyBase(obj, id);
}

void OpenDKIMVerifyAsyncWorker::HandleOKCallback() {
  Nan::HandleScope scope;

  v8::Local<v8::Value> argv[] = {
    Nan::Undefined(),
    Nan::Undefined()
  };

  callback->Call(2, argv);
}
