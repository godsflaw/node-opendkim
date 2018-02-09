#include "opendkim_chunk_async.h"

//
// OpenDKIM call chunk function
//
void OpenDKIMChunkAsyncWorker::Execute() {
  if (result != NULL) {
    return;
  }

  result = OpenDKIM::ChunkBase(obj, message, length);
}

void OpenDKIMChunkAsyncWorker::HandleOKCallback() {
  Nan::HandleScope scope;

  v8::Local<v8::Value> argv[] = {
    Nan::Undefined(),
    Nan::Undefined()
  };

  callback->Call(2, argv);
}
