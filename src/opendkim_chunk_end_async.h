#ifndef _OPENDKIMCHUNKENDASYNC_H
#define _OPENDKIMCHUNKENDASYNC_H

#include "opendkim_async.h"

class OpenDKIMChunkEndAsyncWorker : public OpenDKIMAsyncWorker {
  public:
    OpenDKIMChunkEndAsyncWorker(Nan::NAN_METHOD_ARGS_TYPE info) :
      OpenDKIMAsyncWorker(new Nan::Callback(info[0].As<v8::Function>()))
    {
      obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
    };

    void Execute();
    void HandleOKCallback();

  private:
    // private methods/variables here
};

#endif /* _OPENDKIMCHUNKENDASYNC_ */
