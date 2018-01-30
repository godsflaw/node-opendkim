#include "opendkim_body_async.h"

//
// OpenDKIM call body function
//
void OpenDKIMBodyAsyncWorker::Execute() {
  if (result != NULL) {
    return;
  }

  result = OpenDKIM::BodyBase(obj, body, length);
}

void OpenDKIMBodyAsyncWorker::HandleOKCallback() {
  Nan::HandleScope scope;

  v8::Local<v8::Value> argv[] = {
    Nan::Undefined(),
    Nan::Undefined()
  };

  callback->Call(2, argv);
}
