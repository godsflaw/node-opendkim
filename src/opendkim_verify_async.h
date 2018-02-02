#ifndef _OPENDKIMVERIFYASYNC_H
#define _OPENDKIMVERIFYASYNC_H

#include "opendkim_async.h"

class OpenDKIMVerifyAsyncWorker : public OpenDKIMAsyncWorker {
  public:
    OpenDKIMVerifyAsyncWorker(Nan::NAN_METHOD_ARGS_TYPE info) :
      OpenDKIMAsyncWorker(new Nan::Callback(info[1].As<v8::Function>()))
    {
      result = OpenDKIM::VerifyArgs(info, &obj, &id);
    };

    void Execute();
    void HandleOKCallback();

  private:
    // private methods/variables here
    char *id;
};

#endif /* _OPENDKIMVERIFYASYNC_ */
