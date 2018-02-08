#include "opendkim_flush_cache_async.h"

//
// OpenDKIM call flush_cache function
//
void OpenDKIMFlushCacheAsyncWorker::Execute() {
  if (result != NULL) {
    return;
  }

  result = OpenDKIM::FlushCacheBase(&records);
}

void OpenDKIMFlushCacheAsyncWorker::HandleOKCallback() {
  Nan::HandleScope scope;

  v8::Local<v8::Value> argv[] = {
    Nan::Undefined(),
    Nan::Undefined()
  };

  if (records != -1) {
    argv[1] = Nan::New<v8::Integer>(records);
  }

  callback->Call(2, argv);
}
