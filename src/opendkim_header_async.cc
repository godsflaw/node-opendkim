#include "opendkim_header_async.h"

//
// OpenDKIM call header function
//
void OpenDKIMHeaderAsyncWorker::Execute() {
  if (result != NULL) {
    return;
  }

  result = OpenDKIM::HeaderBase(obj, header, length);
}

void OpenDKIMHeaderAsyncWorker::HandleOKCallback() {
  Nan::HandleScope scope;

  v8::Local<v8::Value> argv[] = {
    Nan::Undefined(),
    Nan::Undefined()
  };

  callback->Call(2, argv);
}
