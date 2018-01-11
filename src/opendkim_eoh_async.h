#ifndef _OPENDKIMEOHASYNC_H
#define _OPENDKIMEOHASYNC_H

#include "opendkim_async.h"

class OpenDKIMEOHAsyncWorker : public OpenDKIMAsyncWorker {
  public:
    OpenDKIMEOHAsyncWorker(Nan::NAN_METHOD_ARGS_TYPE info) :
      OpenDKIMAsyncWorker(new Nan::Callback(info[0].As<v8::Function>()))
    {
      obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
    };

    void Execute();
    void HandleOKCallback();

  private:
    // private methods/variables here
};

#endif /* _OPENDKIMEOHASYNC_ */
