#ifndef _OPENDKIMEOHASYNC_H
#define _OPENDKIMEOHASYNC_H

#include "opendkim_async.h"

class OpenDKIMEOHAsyncWorker : public OpenDKIMAsyncWorker {
  public:
    OpenDKIMEOHAsyncWorker(Nan::NAN_METHOD_ARGS_TYPE info) :
      OpenDKIMAsyncWorker(new Nan::Callback(info[0].As<v8::Function>()))
    {
      obj = Nan::ObjectWrap::Unwrap<OpenDKIM>(info.Holder());
      v8::Local<v8::Object> _this = info.This();
      SaveToPersistent("OpenDKIM", _this);
    };

    void Execute();
    void HandleOKCallback();

  private:
    // private methods/variables here
};

#endif /* _OPENDKIMEOHASYNC_ */
