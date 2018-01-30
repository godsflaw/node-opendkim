#include "opendkim_eoh_async.h"

//
// OpenDKIM call eoh function
//
void OpenDKIMEOHAsyncWorker::Execute() {
  if (result != NULL) {
    return;
  }

  result = OpenDKIM::EOHBase(obj);
}

void OpenDKIMEOHAsyncWorker::HandleOKCallback() {
  Nan::HandleScope scope;

  v8::Local<v8::Value> argv[] = {
    Nan::Undefined(),
    Nan::Undefined()
  };

  callback->Call(2, argv);
}
