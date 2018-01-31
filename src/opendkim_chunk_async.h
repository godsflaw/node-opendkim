#ifndef _OPENDKIMCHUNKASYNC_H
#define _OPENDKIMCHUNKASYNC_H

#include "opendkim_async.h"

class OpenDKIMChunkAsyncWorker : public OpenDKIMAsyncWorker {
  public:
    OpenDKIMChunkAsyncWorker(Nan::NAN_METHOD_ARGS_TYPE info) :
      OpenDKIMAsyncWorker(new Nan::Callback(info[1].As<v8::Function>()))
    {
      result = OpenDKIM::ChunkArgs(
        info,
        &obj,
        &message,
        &length
      );
    };

    void Execute();
    void HandleOKCallback();

  private:
    // private methods/variables here
    char *message;
    int length;
};

#endif /* _OPENDKIMCHUNKASYNC_ */
