#ifndef _OPENDKIMBODYASYNC_H
#define _OPENDKIMBODYASYNC_H

#include "opendkim_async.h"

class OpenDKIMBodyAsyncWorker : public OpenDKIMAsyncWorker {
  public:
    OpenDKIMBodyAsyncWorker(Nan::NAN_METHOD_ARGS_TYPE info) :
      OpenDKIMAsyncWorker(new Nan::Callback(info[1].As<v8::Function>()))
    {
      result = OpenDKIM::BodyArgs(
        info,
        &obj,
        &body,
        &length
      );
    };

    void Execute();
    void HandleOKCallback();

  private:
    // private methods/variables here
    char *body;
    int length;
};

#endif /* _OPENDKIMBODYASYNC_ */
