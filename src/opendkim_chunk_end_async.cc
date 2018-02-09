#include "opendkim_chunk_end_async.h"

//
// OpenDKIM call chunk function
//
void OpenDKIMChunkEndAsyncWorker::Execute() {
  if (result != NULL) {
    return;
  }

  result = OpenDKIM::ChunkEndBase(obj);
}

void OpenDKIMChunkEndAsyncWorker::HandleOKCallback() {
  Nan::HandleScope scope;

  v8::Local<v8::Value> argv[] = {
    Nan::Undefined(),
    Nan::Undefined()
  };

  callback->Call(2, argv);
}
