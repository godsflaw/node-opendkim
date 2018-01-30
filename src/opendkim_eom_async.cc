#include "opendkim_eom_async.h"

//
// OpenDKIM call eom function
//
void OpenDKIMEOMAsyncWorker::Execute() {
  if (result != NULL) {
    return;
  }

  result = OpenDKIM::EOMBase(obj, returntest, &testkey);
}

void OpenDKIMEOMAsyncWorker::HandleOKCallback() {
  Nan::HandleScope scope;
  v8::Local<v8::Value> argv[] = {
    Nan::Undefined(),    // err
    Nan::Undefined()     // result
  };

  if (returntest) {
    argv[1] = Nan::New<v8::Boolean>(testkey ? true : false);
  }

  callback->Call(2, argv);
}
