#ifndef _OPENDKIMFLUSHCACHEASYNC_H
#define _OPENDKIMFLUSHCACHEASYNC_H

#include "opendkim_async.h"

class OpenDKIMFlushCacheAsyncWorker : public OpenDKIMAsyncWorker {
  public:
    OpenDKIMFlushCacheAsyncWorker(Nan::NAN_METHOD_ARGS_TYPE info) :
      OpenDKIMAsyncWorker(new Nan::Callback(info[0].As<v8::Function>()))
    {
      v8::Local<v8::Object> _this = info.This();
      SaveToPersistent("OpenDKIM", _this);
    };

    void Execute();
    void HandleOKCallback();

  private:
    // private methods/variables here
    int records;
};

#endif /* _OPENDKIMFLUSHCACHEASYNC_ */
