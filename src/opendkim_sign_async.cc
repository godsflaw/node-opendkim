#include "opendkim_sign_async.h"

//
// OpenDKIM call sign function
//
void OpenDKIMSignAsyncWorker::Execute() {
  if (result != NULL) {
    return;
  }

  result = OpenDKIM::SignBase(
    obj, id, secretkey, selector, domain, hdrcanon, bodycanon, signalg, length
  );
}

void OpenDKIMSignAsyncWorker::HandleOKCallback() {
  Nan::HandleScope scope;

  v8::Local<v8::Value> argv[] = {
    Nan::Null(),
    Nan::Null()
  };                                                                                                     
                                                                                                         
  callback->Call(2, argv);                                                                               
}
